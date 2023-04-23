import { useState } from "react";

type props = {
  image: ImageMetadata;
  hrefUrl: string;
  title: string;
  description: string;
};

export const PortfolioCard = ({
  image,
  hrefUrl,
  title,
  description,
}: props) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className=" card w-96 h-52 bg-white shadow-xl  "
      onMouseEnter={() => {
        setShow(true);
      }}
      onMouseLeave={() => {
        setShow(false);
      }}
    >
      {show ? (
        <figure>
          <img
            src={image.src}
            alt="Waters Massage Therapy logo of a purple humming bird"
            className={
              "opacity-100 relative col-start-1 row-start-1 pt-4 grid object-cover h-full"
            }
          />
          <div className="card-body absolute items-center text-center bg-slate-800 top-0 bottom-0 rounded-xl opacity-95">
            <h2 className="card-title">{title}</h2>
            <p>{description}</p>
            <div className="card-actions justify-end">
              <a href={hrefUrl} target="_blank">
                <button className="btn btn-primary">Visit</button>
              </a>
            </div>
          </div>
        </figure>
      ) : (
        <figure>
          <img
            src={image.src}
            alt="Waters Massage Therapy logo of a purple humming bird"
            className={
              "opacity-100 relative col-start-1 row-start-1 pt-4 grid object-cover h-full"
            }
          />
        </figure>
      )}
    </div>
  );
};
