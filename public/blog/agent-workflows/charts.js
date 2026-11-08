const DATA_URL = "/blog/agent-workflows/data.json";
const NS = "http://www.w3.org/2000/svg";
const NARROW_WIDTH = 520;
const COLORS = {
	text: "#ffffff",
	textSecondary: "rgba(255, 255, 255, 0.78)",
	textMuted: "rgba(255, 255, 255, 0.6)",
	surface: "#002438",
	chrome: "#032033",
	line: "#12455e",
	bar: "#6da7ec",
	pair: "#3987e5",
	overloaded: "#d95926",
	light: "#9085e9",
	trusters: "#199e70",
	self: "#199e70",
	pain: "#d95926",
};
const AXIS = {
	parallelism: 0,
	autonomy: 1,
	orchestration: 2,
	spec: 3,
	review: 4,
	verification: 5,
	isolation: 6,
	tooling: 7,
	remote: 8,
};
const AXIS_LABELS = [
	"Parallelism",
	"Autonomy",
	"Orchestration",
	"Spec rigor",
	"Human review",
	"Auto verification",
	"Isolation",
	"Tooling built",
	"Remote / phone",
];
const PARALLELISM_STEPS = ["1", "2-3", "4-6", "7-15", "16+"];
const REVIEW_STEPS = [
	"outcome only",
	"high-risk files only",
	"skims",
	"most diffs",
	"every line + manual test",
];
const REVIEW_STEPS_SHORT = [
	"outcome",
	"risky files",
	"skims",
	"most diffs",
	"every line",
];
const VENUE_LABELS = {
	x: "X",
	hn: "Hacker News",
	lobsters: "lobste.rs",
	blog: "Blog",
	reddit: "Reddit",
	youtube: "Talk",
	other: "Other",
};
const SELF = "John Waters (me)";
const DELEGATION_SPLIT = 2;
const READS_MOST_DIFFS = 3;
const DELEGATION_BIN_WIDTH = 0.5;
const QUADRANTS = [
	{
		key: "pair",
		title: "Pair programmers",
		blurb: "hand off little, read most diffs",
		color: COLORS.pair,
		isTop: true,
		isRight: false,
	},
	{
		key: "overloaded",
		title: "Overloaded reviewers",
		blurb: "hand off a lot, still read most diffs",
		color: COLORS.overloaded,
		isTop: true,
		isRight: true,
	},
	{
		key: "light",
		title: "Light touch",
		blurb: "hand off little, skim or less",
		color: COLORS.light,
		isTop: false,
		isRight: false,
	},
	{
		key: "trusters",
		title: "Harness trusters",
		blurb: "hand off a lot, skim or less",
		color: COLORS.trusters,
		isTop: false,
		isRight: true,
	},
];
const CALLOUTS = [
	{ who: "Theo Browne (t3dotgg)", note: "Theo, T3", keepWhenNarrow: true },
	{ who: "Julius Marminge (T3 Code)", note: "Julius Marminge, T3 Code" },
	{
		who: "Boris Cherny (Claude Code)",
		note: "Boris Cherny, Claude Code",
		keepWhenNarrow: true,
	},
	{
		who: "Mitchell Hashimoto",
		note: "Mitchell Hashimoto",
		isRingOnly: true,
		keepWhenNarrow: true,
	},
	{ who: "Charlieholtz (Conductor creator)", note: "Charlie Holtz, Conductor" },
	{ who: "Peter Steinberger", note: "Peter Steinberger" },
	{ who: "Simon Willison", note: "Simon Willison" },
	{ who: "Armin Ronacher", note: "Armin Ronacher" },
	{ who: "Addy Osmani", note: "Addy Osmani" },
	{ who: "thorstenball", note: "Thorsten Ball, Amp" },
	{ who: "mattpocockuk", note: "Matt Pocock" },
	{ who: SELF, note: "Me", isSelf: true, keepWhenNarrow: true },
];

const el = (tag, attributes, parent) => {
	const node = document.createElementNS(NS, tag);
	for (const [key, value] of Object.entries(attributes || {})) {
		node.setAttribute(key, value);
	}
	if (parent) parent.appendChild(node);
	return node;
};
const text = (parent, x, y, content, attributes) => {
	const node = el(
		"text",
		Object.assign(
			{ x, y, fill: COLORS.text, "font-size": 12 },
			attributes || {},
		),
		parent,
	);
	node.textContent = content;
	return node;
};
const groupBy = (items, keyOf) => {
	const groups = {};
	for (const item of items) {
		const key = keyOf(item);
		groups[key] = groups[key] || [];
		groups[key].push(item);
	}
	return groups;
};
const escapeHtml = (value) =>
	String(value == null ? "" : value).replace(
		/[&<>"]/g,
		(character) =>
			({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character],
	);
const mean = (values) =>
	values.length
		? values.reduce((sum, value) => sum + value, 0) / values.length
		: null;
const percent = (part, whole) => (whole ? Math.round((100 * part) / whole) : 0);
const sharePercentLabel = (part, whole) =>
	part && percent(part, whole) === 0 ? "<1%" : `${percent(part, whole)}%`;
const shortAdeName = (name) =>
	name
		.replace(/ \(.*\)$/, "")
		.replace("None: bare agent CLI", "Bare agent CLI");
const joinNames = (names) =>
	names.length < 2
		? names.join("")
		: `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
const calloutNote = (who) =>
	(CALLOUTS.find((callout) => callout.who === who) || { note: who }).note.split(
		",",
	)[0];
const isNamed = (who) => CALLOUTS.some((callout) => callout.who === who);
const NARROW_ADE_NAMES = {
	"Terminal multiplexer": "tmux, Zellij",
	"Vendor app or cloud": "Vendor app",
	"Other orchestrator app": "Other app",
};
const adeLabel = (name, isNarrow) =>
	(isNarrow && NARROW_ADE_NAMES[shortAdeName(name)]) || shortAdeName(name);
const measureText = (svg, content, fontSize, fontWeight) => {
	const probe = text(svg, -9999, -9999, content, {
		"font-size": fontSize,
		"font-weight": fontWeight || 400,
	});
	const measuredWidth = probe.getComputedTextLength();
	probe.remove();
	return measuredWidth;
};

const tooltip = document.createElement("div");
Object.assign(tooltip.style, {
	position: "fixed",
	pointerEvents: "none",
	background: COLORS.chrome,
	border: `1px solid ${COLORS.line}`,
	borderRadius: "8px",
	padding: "10px 12px",
	fontSize: "13px",
	lineHeight: "1.45",
	maxWidth: "320px",
	boxShadow: "0 8px 28px rgba(0, 0, 0, 0.45)",
	color: COLORS.text,
	display: "none",
	zIndex: "50",
});
document.body.appendChild(tooltip);
const showTip = (event, html) => {
	tooltip.innerHTML = html;
	tooltip.style.display = "block";
	const x = Math.max(
		8,
		Math.min(event.clientX + 14, window.innerWidth - tooltip.offsetWidth - 8),
	);
	const belowY = event.clientY + 14;
	const y =
		belowY + tooltip.offsetHeight > window.innerHeight - 8
			? event.clientY - tooltip.offsetHeight - 14
			: belowY;
	tooltip.style.left = `${x}px`;
	tooltip.style.top = `${Math.max(8, y)}px`;
};
const hideTip = () => {
	tooltip.style.display = "none";
};
document.addEventListener("scroll", hideTip, { passive: true });
document.addEventListener("pointerdown", (event) => {
	if (!event.target.closest?.("[data-chart]")) hideTip();
});
const attachTip = (node, html) => {
	node.style.cursor = "pointer";
	node.addEventListener("pointermove", (event) => showTip(event, html()));
	node.addEventListener("pointerdown", (event) => showTip(event, html()));
	node.addEventListener("pointerleave", (event) => {
		if (event.pointerType === "mouse") hideTip();
	});
};
const tipTitle = (content) =>
	`<div style="font-weight:650">${escapeHtml(content)}</div>`;
const tipMuted = (content) =>
	`<div style="color:${COLORS.textSecondary}">${escapeHtml(content)}</div>`;

function buildModel(data) {
	const rows = data.rows;
	const scoredCount = (row) =>
		row.scores.filter((score) => score !== null).length;
	const delegationOf = (row) =>
		mean(
			[AXIS.parallelism, AXIS.autonomy, AXIS.orchestration]
				.map((index) => row.scores[index])
				.filter((score) => score !== null),
		);
	const reviewOf = (row) => row.scores[AXIS.review];
	const quadrantOf = (row) =>
		QUADRANTS.find(
			(quadrant) =>
				quadrant.isTop === reviewOf(row) >= READS_MOST_DIFFS &&
				quadrant.isRight === delegationOf(row) >= DELEGATION_SPLIT,
		);
	const richRows = rows.filter((row) => scoredCount(row) >= 4);
	const placedRows = richRows.filter(
		(row) => delegationOf(row) !== null && reviewOf(row) !== null,
	);
	const statedRows = rows.filter((row) => row.ade !== "Not stated");
	return {
		data,
		rows,
		richRows,
		placedRows,
		statedRows,
		delegationOf,
		reviewOf,
		quadrantOf,
	};
}

const rowTip = (row) => {
	const scores = AXIS_LABELS.map(
		(label, index) =>
			`${label} ${row.scores[index] === null ? "-" : row.scores[index]}`,
	).join(" &middot; ");
	const quote = row.quote
		? `<div style="font-style:italic;margin-top:6px">"${escapeHtml(row.quote)}"</div>`
		: "";
	const venue = VENUE_LABELS[row.venue] || row.venue || "";
	return `${tipTitle(row.who)}${tipMuted(`${venue} · ${shortAdeName(row.ade)} · ${row.tools.join(", ")}`)}<div style="color:${COLORS.textSecondary};margin-top:4px;font-size:12px">${scores}</div>${quote}`;
};

function renderAdeShare(svg, width, model) {
	const groups = groupBy(model.statedRows, (row) => row.ade);
	const ordered = Object.entries(groups).sort(
		(first, second) => second[1].length - first[1].length,
	);
	const isNarrow = width < NARROW_WIDTH;
	const labelFontSize = isNarrow ? 11.5 : 13;
	const labelWidth =
		Math.max(
			...ordered.map(([name]) =>
				measureText(svg, adeLabel(name, isNarrow), labelFontSize, 700),
			),
		) + 10;
	const valueWidth = measureText(svg, "125 (36%), me", 12, 600) + 8;
	const rowHeight = 28;
	const height = ordered.length * rowHeight + 8;
	svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
	svg.setAttribute("height", height);
	const maxCount = ordered[0][1].length;
	const barSpace = width - labelWidth - valueWidth;
	ordered.forEach(([name, members], index) => {
		const y = index * rowHeight + 4;
		const isSelfAde =
			members.some((row) => row.who === SELF) && name === "Glimmervoid";
		const barWidth = Math.max(4, (members.length / maxCount) * barSpace);
		text(svg, labelWidth - 10, y + 15, adeLabel(name, isNarrow), {
			"text-anchor": "end",
			"font-size": labelFontSize,
			"font-weight": isSelfAde ? 700 : 400,
		});
		const bar = el(
			"rect",
			{
				x: labelWidth,
				y: y + 5,
				width: barWidth,
				height: 14,
				rx: 3,
				fill: isSelfAde ? COLORS.self : COLORS.bar,
			},
			svg,
		);
		text(
			svg,
			labelWidth + barWidth + 6,
			y + 16,
			`${members.length} (${sharePercentLabel(members.length, model.statedRows.length)})${isSelfAde ? ", me" : ""}`,
			{ "font-size": 12, "font-weight": 600 },
		);
		const hit = el(
			"rect",
			{ x: 0, y, width, height: rowHeight, fill: "transparent" },
			svg,
		);
		const namedMembers = members
			.filter((row) => isNamed(row.who))
			.map((row) => calloutNote(row.who));
		attachTip(hit, () => {
			const sample =
				members
					.slice(0, 8)
					.map((row) => row.who)
					.join(", ") + (members.length > 8 ? ", and more" : "");
			return `${tipTitle(name)}<div>${members.length} people${namedMembers.length ? `, including ${escapeHtml(joinNames(namedMembers))}` : ""}</div>${tipMuted(sample)}`;
		});
		bar.style.pointerEvents = "none";
	});
}

const boxTouchesDisk = (box, disk) =>
	Math.hypot(
		disk.x - Math.max(box.x1, Math.min(box.x2, disk.x)),
		disk.y - Math.max(box.y1, Math.min(box.y2, disk.y)),
	) < disk.r;

function sunflowerOffsets(count, spacing) {
	const goldenAngle = Math.PI * (3 - Math.sqrt(5));
	return Array.from({ length: count }, (_, index) => {
		const distance = count === 1 ? 0 : spacing * 0.56 * Math.sqrt(index + 0.5);
		return {
			dx: distance * Math.cos(index * goldenAngle),
			dy: distance * Math.sin(index * goldenAngle),
		};
	});
}

function renderQuadrant(svg, width, model) {
	const isNarrow = width < NARROW_WIDTH;
	const reviewLabels = isNarrow ? REVIEW_STEPS_SHORT : REVIEW_STEPS;
	const reviewFontSize = isNarrow ? 10.5 : 12;
	const left = 4;
	const right = width - 4;
	const top = isNarrow ? 58 : 62;
	const plotHeight = isNarrow ? 480 : 650;
	const bottom = top + plotHeight;
	const height = bottom + (isNarrow ? 92 : 96);
	const radius = isNarrow ? 3.2 : 4.5;
	svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
	svg.setAttribute("height", height);
	const xScale = (value) => left + (value / 4) * (right - left);
	const rowHeight = plotHeight / 5;
	const rowLabelBand = 20;
	const rowTop = (review) => top + (4 - review) * rowHeight;
	const rowCenter = (review) => rowTop(review) + rowLabelBand / 2 + rowHeight / 2;
	const splitY = top + 2 * rowHeight;
	const splitX = xScale(DELEGATION_SPLIT);
	const visible = model.placedRows;

	QUADRANTS.forEach((quadrant) => {
		const x1 = quadrant.isRight ? splitX : left;
		const x2 = quadrant.isRight ? right : splitX;
		const y1 = quadrant.isTop ? top : splitY;
		const y2 = quadrant.isTop ? splitY : bottom;
		el(
			"rect",
			{
				x: x1 + 1,
				y: y1 + 1,
				width: x2 - x1 - 2,
				height: y2 - y1 - 2,
				rx: 6,
				fill: quadrant.color,
				"fill-opacity": 0.14,
			},
			svg,
		);
	});
	[4, 3, 2, 1, 0].forEach((review) => {
		text(svg, left + 10, rowTop(review) + 18, reviewLabels[review], {
			"text-anchor": "start",
			"font-size": reviewFontSize,
			fill: COLORS.textSecondary,
		});
	});
	el(
		"line",
		{
			x1: splitX,
			x2: splitX,
			y1: top,
			y2: bottom,
			stroke: COLORS.textMuted,
			"stroke-dasharray": "4 4",
		},
		svg,
	);
	el(
		"line",
		{
			x1: left,
			x2: right,
			y1: splitY,
			y2: splitY,
			stroke: COLORS.textMuted,
			"stroke-dasharray": "4 4",
		},
		svg,
	);

	const binCenter = (delegation) =>
		Math.min(
			Math.floor(delegation / DELEGATION_BIN_WIDTH),
			4 / DELEGATION_BIN_WIDTH - 1,
		) *
			DELEGATION_BIN_WIDTH +
		DELEGATION_BIN_WIDTH / 2;
	const membersByCell = groupBy(
		visible,
		(row) => `${model.reviewOf(row)}:${binCenter(model.delegationOf(row))}`,
	);
	const callouts = CALLOUTS.filter(
		(callout) => !isNarrow || callout.keepWhenNarrow,
	);
	const isCalledOut = (row) =>
		callouts.some((callout) => callout.who === row.who);
	const spacing = radius * 2 + 1.5;
	const positionByWho = {};
	const clusterDisks = [];
	Object.entries(membersByCell).forEach(([cellKey, members]) => {
		const [review, cellCenter] = cellKey.split(":").map(Number);
		const centerX = xScale(cellCenter);
		const centerY = rowCenter(review);
		const clusterRadius = spacing * 0.56 * Math.sqrt(members.length) + radius;
		clusterDisks.push({
			x: centerX,
			y: centerY,
			r: clusterRadius + 1,
			count: members.length,
		});
		members.sort(
			(first, second) =>
				isCalledOut(first) - isCalledOut(second) ||
				model.delegationOf(first) - model.delegationOf(second),
		);
		sunflowerOffsets(members.length, spacing).forEach((offset, index) => {
			const row = members[index];
			const cx = centerX + offset.dx;
			const cy = centerY + offset.dy;
			positionByWho[row.who] = {
				x: cx,
				y: cy,
				centerX,
				centerY,
				clusterRadius,
			};
			const isSelf = row.who === SELF;
			const dot = el(
				"circle",
				{
					cx,
					cy,
					r: radius,
					fill: model.quadrantOf(row).color,
					stroke: isSelf ? COLORS.text : COLORS.surface,
					"stroke-width": isSelf ? 2 : 1.2,
				},
				svg,
			);
			const hit = el(
				"circle",
				{ cx, cy, r: radius + 3, fill: "transparent" },
				svg,
			);
			attachTip(hit, () => rowTip(row));
			hit.addEventListener("pointerenter", () =>
				dot.setAttribute("r", radius + 2.5),
			);
			hit.addEventListener("pointerleave", () => dot.setAttribute("r", radius));
			hit.addEventListener("click", (event) => {
				if (event.pointerType !== "mouse" || !row.source) return;
				window.open(row.source, "_blank", "noopener");
			});
		});
	});

	const placedLabelBoxes = [];
	const overlaps = (box, other) =>
		box.x1 < other.x2 &&
		other.x1 < box.x2 &&
		box.y1 < other.y2 &&
		other.y1 < box.y2;
	const drawCalloutRing = (position) =>
		el(
			"circle",
			{
				cx: position.x,
				cy: position.y,
				r: radius + 2.5,
				fill: "none",
				stroke: COLORS.text,
				"stroke-width": 1.5,
				"pointer-events": "none",
			},
			svg,
		);
	callouts.forEach((callout) => {
		const position = positionByWho[callout.who];
		if (!position) return;
		if (callout.isRingOnly) {
			drawCalloutRing(position);
			return;
		}
		const fontSize = isNarrow ? 11 : 12;
		const labelWidth = measureText(
			svg,
			callout.note,
			fontSize,
			callout.isSelf ? 750 : 600,
		);
		const reach = position.clusterRadius + 12;
		const radialLength =
			Math.hypot(
				position.x - position.centerX,
				position.y - position.centerY,
			) || 1;
		const unitX = (position.x - position.centerX) / radialLength;
		const unitY =
			radialLength === 1 ? -1 : (position.y - position.centerY) / radialLength;
		const radialX = position.centerX + unitX * reach;
		const radialY = position.centerY + unitY * reach;
		const radialAnchor =
			Math.abs(unitX) < 0.45 ? "middle" : unitX > 0 ? "start" : "end";
		const candidates = [
			{
				x: radialX,
				y: radialY + (unitY > 0.3 ? 9 : unitY < -0.3 ? 0 : 4),
				anchor: radialAnchor,
			},
			{ x: radialX, y: radialY + (unitY > 0 ? 27 : -18), anchor: radialAnchor },
			{ x: position.x, y: position.y - reach, anchor: "middle" },
			{ x: position.x, y: position.y + reach + 9, anchor: "middle" },
			{ x: position.x + reach, y: position.y - reach * 0.6, anchor: "start" },
			{ x: position.x - reach, y: position.y - reach * 0.6, anchor: "end" },
			{
				x: position.x + reach,
				y: position.y + reach * 0.7 + 9,
				anchor: "start",
			},
			{ x: position.x - reach, y: position.y + reach * 0.7 + 9, anchor: "end" },
			{ x: position.x, y: position.y - reach - 18, anchor: "middle" },
			{ x: position.x, y: position.y + reach + 27, anchor: "middle" },
		].map((candidate) => {
			const boxLeft =
				candidate.anchor === "start"
					? candidate.x
					: candidate.anchor === "end"
						? candidate.x - labelWidth
						: candidate.x - labelWidth / 2;
			return {
				...candidate,
				box: {
					x1: boxLeft - 3,
					x2: boxLeft + labelWidth + 3,
					y1: candidate.y - fontSize,
					y2: candidate.y + 4,
				},
			};
		});
		const insideChart = (box) =>
			box.x1 >= left + 2 &&
			box.x2 <= right - 2 &&
			box.y1 >= top + 2 &&
			box.y2 <= bottom - 2;
		const coversCluster = (box) =>
			clusterDisks.some((disk) => boxTouchesDisk(box, disk));
		const isFree = (candidate) =>
			insideChart(candidate.box) &&
			!placedLabelBoxes.some((other) => overlaps(candidate.box, other));
		const chosen =
			candidates.find(
				(candidate) => isFree(candidate) && !coversCluster(candidate.box),
			) ||
			candidates.find(isFree) ||
			candidates[0];
		placedLabelBoxes.push(chosen.box);
		const labelCenterY = (chosen.box.y1 + chosen.box.y2) / 2;
		const leaderEndX = Math.max(
			chosen.box.x1,
			Math.min(chosen.box.x2, position.x),
		);
		const leaderEndY =
			position.y < chosen.box.y1
				? chosen.box.y1
				: position.y > chosen.box.y2
					? chosen.box.y2
					: labelCenterY;
		el(
			"line",
			{
				x1: position.x,
				y1: position.y,
				x2: leaderEndX,
				y2: leaderEndY,
				stroke: COLORS.text,
				"stroke-width": 1,
				"pointer-events": "none",
			},
			svg,
		);
		drawCalloutRing(position);
		text(svg, chosen.x, chosen.y, callout.note, {
			"text-anchor": chosen.anchor,
			"font-size": fontSize,
			"font-weight": callout.isSelf ? 750 : 600,
			stroke: COLORS.surface,
			"stroke-width": 4,
			"paint-order": "stroke",
			"pointer-events": "none",
		});
	});

	clusterDisks
		.filter((disk) => disk.count >= 2)
		.forEach((disk) => {
			const spots = [
				{
					x: disk.x,
					y: disk.y + disk.r + 11,
					anchor: "middle",
					box: {
						x1: disk.x - 8,
						x2: disk.x + 8,
						y1: disk.y + disk.r + 1,
						y2: disk.y + disk.r + 13,
					},
				},
				{
					x: disk.x + disk.r + 3,
					y: disk.y + 4,
					anchor: "start",
					box: {
						x1: disk.x + disk.r + 1,
						x2: disk.x + disk.r + 18,
						y1: disk.y - 6,
						y2: disk.y + 6,
					},
				},
				{
					x: disk.x - disk.r - 3,
					y: disk.y + 4,
					anchor: "end",
					box: {
						x1: disk.x - disk.r - 18,
						x2: disk.x - disk.r - 1,
						y1: disk.y - 6,
						y2: disk.y + 6,
					},
				},
			];
			const hitsOtherCluster = (box) =>
				clusterDisks.some(
					(other) => other !== disk && boxTouchesDisk(box, other),
				);
			const spot = spots.find(
				(candidate) =>
					!placedLabelBoxes.some((box) => overlaps(candidate.box, box)) &&
					!hitsOtherCluster(candidate.box),
			);
			if (!spot) return;
			text(svg, spot.x, spot.y, String(disk.count), {
				"text-anchor": spot.anchor,
				"font-size": 10,
				"font-weight": 600,
				fill: COLORS.textMuted,
				"pointer-events": "none",
			});
		});

	QUADRANTS.forEach((quadrant) => {
		const members = visible.filter(
			(row) => model.quadrantOf(row) === quadrant,
		).length;
		const share = percent(members, visible.length);
		const x = quadrant.isRight ? right : left;
		const anchor = quadrant.isRight ? "end" : "start";
		const y = quadrant.isTop ? 22 : bottom + 26;
		text(svg, x, y, `${share}%`, {
			"text-anchor": anchor,
			"font-size": isNarrow ? 18 : 20,
			"font-weight": 700,
		});
		const nameY = y + 17;
		text(svg, x, nameY, quadrant.title, {
			"text-anchor": anchor,
			"font-size": isNarrow ? 10.5 : 13,
			"font-weight": 650,
			fill: quadrant.color === COLORS.light ? "#b5adf2" : quadrant.color,
		});
		const withBlurb = `${quadrant.blurb}, ${members} people`;
		const blurbFits =
			!isNarrow && measureText(svg, withBlurb, 11) < (right - left) / 2 - 12;
		text(svg, x, nameY + 15, blurbFits ? withBlurb : `${members} people`, {
			"text-anchor": anchor,
			"font-size": 11,
			fill: COLORS.textSecondary,
		});
	});

	const axisY = height - 12;
	text(svg, left, axisY, isNarrow ? "← less" : "← hands off less", {
		"font-size": 12,
		"font-weight": 600,
		fill: COLORS.textSecondary,
	});
	if (isNarrow)
		text(svg, (left + right) / 2, axisY, "delegation", {
			"text-anchor": "middle",
			"font-size": 12,
			fill: COLORS.textSecondary,
		});
	text(svg, right, axisY, isNarrow ? "more →" : "hands off more →", {
		"text-anchor": "end",
		"font-size": 12,
		"font-weight": 600,
		fill: COLORS.textSecondary,
	});
}

function renderAdeMix(svg, width, model) {
	const isNarrow = width < NARROW_WIDTH;
	const groups = groupBy(model.placedRows, (row) => row.ade);
	const mixRows = Object.entries(groups)
		.filter(([name, members]) => name !== "Not stated" && members.length >= 5)
		.sort((first, second) => second[1].length - first[1].length)
		.map(([name, members]) => ({ name, members }));
	mixRows.push({ name: "Everyone", members: model.placedRows });
	const legendHeight = isNarrow ? 44 : 26;
	const labelFontSize = isNarrow ? 11.5 : 13;
	const labelWidth =
		Math.max(
			...mixRows.map((entry) =>
				measureText(svg, adeLabel(entry.name, isNarrow), labelFontSize, 700),
			),
		) + 10;
	const countWidth = measureText(svg, "n=160", 11) + 8;
	const barHeight = 20;
	const rowGap = 12;
	const height = legendHeight + mixRows.length * (barHeight + rowGap) + 6;
	svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
	svg.setAttribute("height", height);
	const order = ["pair", "overloaded", "light", "trusters"].map((key) =>
		QUADRANTS.find((quadrant) => quadrant.key === key),
	);
	let legendX = 0;
	let legendY = 12;
	order.forEach((quadrant) => {
		const itemWidth = measureText(svg, quadrant.title, 11.5) + 30;
		if (legendX + itemWidth > width) {
			legendX = 0;
			legendY += 18;
		}
		el(
			"rect",
			{
				x: legendX,
				y: legendY - 9,
				width: 10,
				height: 10,
				rx: 2,
				fill: quadrant.color,
			},
			svg,
		);
		text(svg, legendX + 15, legendY, quadrant.title, {
			"font-size": 11.5,
			fill: COLORS.textSecondary,
		});
		legendX += itemWidth;
	});
	const barLeft = labelWidth;
	const barRight = width - countWidth;
	mixRows.forEach((entry, index) => {
		const y = legendHeight + index * (barHeight + rowGap);
		const isEveryone = entry.name === "Everyone";
		if (isEveryone)
			el(
				"line",
				{
					x1: 0,
					x2: width,
					y1: y - rowGap / 2,
					y2: y - rowGap / 2,
					stroke: COLORS.line,
				},
				svg,
			);
		text(svg, labelWidth - 10, y + 14, adeLabel(entry.name, isNarrow), {
			"text-anchor": "end",
			"font-size": labelFontSize,
			"font-weight": isEveryone ? 700 : 400,
		});
		text(svg, barRight + 6, y + 14, `n=${entry.members.length}`, {
			"font-size": 11,
			fill: COLORS.textMuted,
		});
		let cursor = barLeft;
		order.forEach((quadrant) => {
			const count = entry.members.filter(
				(row) => model.quadrantOf(row) === quadrant,
			).length;
			if (!count) return;
			const segmentWidth =
				(count / entry.members.length) * (barRight - barLeft);
			const segment = el(
				"rect",
				{
					x: cursor + 1,
					y,
					width: Math.max(0, segmentWidth - 2),
					height: barHeight,
					rx: 3,
					fill: quadrant.color,
				},
				svg,
			);
			const segmentLabel = `${percent(count, entry.members.length)}%`;
			const segmentFontSize =
				[11, 9, 8].find(
					(size) =>
						measureText(svg, segmentLabel, size, 600) + 3 < segmentWidth,
				) || 11;
			if (
				measureText(svg, segmentLabel, segmentFontSize, 600) + 3 <
				segmentWidth
			)
				text(svg, cursor + segmentWidth / 2, y + 14, segmentLabel, {
					"text-anchor": "middle",
					"font-size": segmentFontSize,
					"font-weight": 600,
					fill: "#ffffff",
					"pointer-events": "none",
				});
			attachTip(
				segment,
				() =>
					`${tipTitle(`${isEveryone ? "Everyone" : shortAdeName(entry.name)}: ${quadrant.title}`)}<div>${count} of ${entry.members.length} people (${percent(count, entry.members.length)}%)</div>${tipMuted(quadrant.blurb)}`,
			);
			cursor += segmentWidth;
		});
	});
}

function renderMachineReview(svg, width, model) {
	const isNarrow = width < NARROW_WIDTH;
	const left = 40;
	const right = width - 6;
	const top = 26;
	const bottom = isNarrow ? 210 : 250;
	const height = bottom + 62;
	svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
	svg.setAttribute("height", height);
	for (let tick = 0; tick <= 4; tick++) {
		const y = bottom - (tick / 4) * (bottom - top);
		el("line", { x1: left, x2: right, y1: y, y2: y, stroke: COLORS.line }, svg);
		text(svg, left - 8, y + 4, `${tick * 25}%`, {
			"text-anchor": "end",
			"font-size": 11,
			fill: COLORS.textMuted,
		});
	}
	const slot = (right - left) / PARALLELISM_STEPS.length;
	PARALLELISM_STEPS.forEach((label, level) => {
		const scored = model.rows.filter(
			(row) =>
				row.scores[AXIS.parallelism] === level &&
				row.scores[AXIS.verification] !== null,
		);
		const machineReviewed = scored.filter(
			(row) => row.scores[AXIS.verification] >= 3,
		).length;
		const share = scored.length ? machineReviewed / scored.length : 0;
		const barWidth = slot * 0.58;
		const x = left + level * slot + (slot - barWidth) / 2;
		const barHeight = share * (bottom - top);
		const isSmall = scored.length < 10;
		el(
			"path",
			{
				d: `M${x},${bottom} V${bottom - barHeight + 4} Q${x},${bottom - barHeight} ${x + 4},${bottom - barHeight} H${x + barWidth - 4} Q${x + barWidth},${bottom - barHeight} ${x + barWidth},${bottom - barHeight + 4} V${bottom} Z`,
				fill: COLORS.trusters,
				"fill-opacity": isSmall ? 0.5 : 1,
			},
			svg,
		);
		text(
			svg,
			x + barWidth / 2,
			bottom - barHeight - 7,
			`${percent(machineReviewed, scored.length)}%`,
			{ "text-anchor": "middle", "font-size": 12.5, "font-weight": 650 },
		);
		text(svg, x + barWidth / 2, bottom + 18, label, {
			"text-anchor": "middle",
			"font-size": 12,
		});
		text(svg, x + barWidth / 2, bottom + 33, `n=${scored.length}`, {
			"text-anchor": "middle",
			"font-size": 10.5,
			fill: COLORS.textMuted,
		});
		const hit = el(
			"rect",
			{
				x: left + level * slot,
				y: top,
				width: slot,
				height: bottom - top,
				fill: "transparent",
			},
			svg,
		);
		attachTip(
			hit,
			() =>
				`${tipTitle(`${label} agent${label === "1" ? "" : "s"} at once`)}<div>${machineReviewed} of ${scored.length} put agent or bot review, evals or blocking hooks in front of themselves</div>`,
		);
	});
	text(svg, (left + right) / 2, height - 6, "Agents running at once", {
		"text-anchor": "middle",
		"font-size": 12,
		"font-weight": 600,
		fill: COLORS.textSecondary,
	});
}

function renderPains(svg, width, model) {
	const isNarrow = width < NARROW_WIDTH;
	const pains = model.data.pains
		.slice()
		.sort((first, second) => second.count - first.count);
	const rowHeight = 40;
	const height = pains.length * rowHeight + 4;
	svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
	svg.setAttribute("height", height);
	const maxCount = pains[0].count;
	const valueWidth = 72;
	pains.forEach((pain, index) => {
		const y = index * rowHeight;
		text(svg, 0, y + 13, isNarrow ? pain.theme.split(":")[0] : pain.theme, {
			"font-size": isNarrow ? 12 : 12.5,
		});
		const barWidth = Math.max(
			4,
			(pain.count / maxCount) * (width - valueWidth),
		);
		const bar = el(
			"rect",
			{
				x: 0,
				y: y + 19,
				width: barWidth,
				height: 12,
				rx: 3,
				fill: COLORS.pain,
			},
			svg,
		);
		text(
			svg,
			barWidth + 6,
			y + 30,
			`${pain.count} (${percent(pain.count, model.data.peopleWithPains)}%)`,
			{ "font-size": 12, "font-weight": 600 },
		);
		attachTip(
			bar,
			() =>
				`${tipTitle(pain.theme)}<div>${pain.count} of the ${model.data.peopleWithPains} people who named any problem</div>`,
		);
	});
}

function renderSources(container, model) {
	const sorted = model.rows
		.slice()
		.sort((first, second) => first.who.localeCompare(second.who));
	const items = sorted.map((row) => {
		const name = row.source
			? `<a href="${escapeHtml(row.source)}" rel="noopener" target="_blank">${escapeHtml(row.who)}</a>`
			: escapeHtml(row.who);
		return `<li>${name} <span style="color:${COLORS.textMuted}">(${escapeHtml(VENUE_LABELS[row.venue] || row.venue || "")}, ${escapeHtml(shortAdeName(row.ade))})</span></li>`;
	});
	container.innerHTML = `<ul style="columns:2 16rem;column-gap:2rem;list-style:none;padding:0;margin:0;font-size:0.85rem;line-height:1.6">${items.join("")}</ul>`;
}

const RENDERERS = {
	"ade-share": renderAdeShare,
	quadrant: renderQuadrant,
	"ade-mix": renderAdeMix,
	"machine-review": renderMachineReview,
	pains: renderPains,
};

function renderAll(model) {
	hideTip();
	document.querySelectorAll("[data-chart]").forEach((figure) => {
		const renderer = RENDERERS[figure.dataset.chart];
		const svg = figure.querySelector("svg");
		if (!renderer || !svg) return;
		const width = Math.round(svg.parentElement.clientWidth);
		if (!width || Number(svg.dataset.renderedWidth) === width) return;
		svg.dataset.renderedWidth = String(width);
		svg.innerHTML = "";
		svg.setAttribute("width", "100%");
		svg.setAttribute("font-family", "inherit");
		renderer(svg, width, model);
	});
}

function showFailure(message) {
	document
		.querySelectorAll(
			"[data-chart] [role=status], [data-sources] [role=status]",
		)
		.forEach((status) => {
			status.textContent = message;
			status.hidden = false;
			if (
				status.nextElementSibling &&
				status.nextElementSibling.dataset.retry !== undefined
			)
				return;
			const retryButton = document.createElement("button");
			retryButton.type = "button";
			retryButton.dataset.retry = "";
			retryButton.className = "btn btn-sm mt-2";
			retryButton.textContent = "Retry charts";
			retryButton.addEventListener("click", () => {
				for (const button of document.querySelectorAll("[data-retry]")) {
					button.remove();
				}
				start();
			});
			status.after(retryButton);
		});
}

async function loadModel() {
	const response = await fetch(DATA_URL).catch(() => null);
	if (!response?.ok) return null;
	const study = await response.json().catch(() => null);
	if (!study) return null;
	return buildModel(study);
}

function redrawAtCurrentWidths(model) {
	for (const svg of document.querySelectorAll("[data-chart] svg")) {
		delete svg.dataset.renderedWidth;
	}
	renderAll(model);
}

async function start() {
	const model = await loadModel();
	if (!model) {
		showFailure(
			"The chart data didn't load, so this chart is missing. The numbers in the text still stand.",
		);
		return;
	}
	document.querySelectorAll("[data-chart] [role=status]").forEach((status) => {
		status.hidden = true;
	});
	renderAll(model);
	document.fonts.ready.then(() => redrawAtCurrentWidths(model));
	const sources = document.querySelector("[data-sources]");
	if (sources) renderSources(sources, model);
	let resizeFrame = 0;
	window.addEventListener("resize", () => {
		cancelAnimationFrame(resizeFrame);
		resizeFrame = requestAnimationFrame(() => renderAll(model));
	});
}

start();
