import {
  faLinkedin,
  faGithub,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function UserProfile({ user }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-black dark:text-white">
      <img src={user.avatar_url || "/hacker.png"} className="card-img-center" />
      <p className="text-gray-600 dark:text-gray-300">
        <i>@{user.username}</i>
      </p>
      <h1 className="text-2xl font-bold text-black dark:text-white">{user.full_name || "Anonymous User"}</h1>
      {user.full_name === "Swapnil Srivastava" ? (
        <div className="flex items-center justify-center gap-x-2">
          <a
            target="_blank"
            href="https://www.linkedin.com/in/swapnilsrivastava/"
            rel="noreferrer"
          >
            <FontAwesomeIcon
              icon={faLinkedin}
              size="2x"
              style={{ color: "#0072b1" }}
            />
          </a>
          <a
            target="_blank"
            href="https://twitter.com/swapnil_sri"
            rel="noreferrer"
          >
            <FontAwesomeIcon
              icon={faXTwitter}
              size="2x"
              style={{ color: "#00acee" }}
            />
          </a>
          <a
            target="_blank"
            href="https://github.com/swapnil-srivastava"
            rel="noreferrer"
          >
            <FontAwesomeIcon 
              icon={faGithub} 
              size="2x" 
              className="text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            />
          </a>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
