import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons";

function Profile() {
  return (
    <>
      <div
        className="p-3 px-16 my-4 
            bg-fun-blue-600
            dark:bg-hit-pink-500 dark:text-blog-white
            rounded-lg 
            drop-shadow-lg
            hover:drop-shadow-xl
            flex items-center justify-center
            hover:brightness-125"
      >
        <button
          className="
                focus:outline-none focus:ring-2 
                focus:ring-fun-blue-400 
                focus:ring-offset-2 text-sm 
                text-blog-black
                font-semibold 
                h-12 px-3 rounded-lg
                bg-hit-pink-500
                dark:bg-fun-blue-600 dark:text-blog-white
                transition-transform pointer-events-auto
                transition-filter duration-500 hover:filter hover:brightness-125
                flex items-center
                "
          onClick={() => console.log("Hello")}
        >
          <div className="pr-2">Load More</div>
          <FontAwesomeIcon icon={faAnglesRight} size={"3x"} />
        </button>
      </div>
    </>
  );
}

export default Profile;
