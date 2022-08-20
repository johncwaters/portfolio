
import { webVitals } from "./vitals";

export interface Props {
    href: string;
    pathname: string;
    vercelId?: string;
}

let analyticsId = import.meta.env.VERCEL_ANALYTICS_ID;

export async function post({ request }: any) {
    //console.log(request)
    const data = request.json();
    console.log(data);

    var test = webVitals({
        path: data.href,
        params: data.pathname,
        analyticsId,
    });

    return new Response(JSON.stringify(test), { status: 200 });
}




