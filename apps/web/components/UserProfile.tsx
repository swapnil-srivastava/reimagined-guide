import {
  faLinkedin,
  faGithub,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage } from 'react-intl';

export default function UserProfile({ user }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-blog-black dark:text-blog-white">
      <img src={user.avatar_url || "/hacker.png"} className="card-img-center" />
      <p className="text-gray-600 dark:text-blog-white">
        <i>@{user.username}</i>
      </p>
      <h1 className="text-2xl font-bold text-blog-black dark:text-blog-white">{user.full_name || (
        <FormattedMessage
          id="userprofile-anonymous-user"
          description="Anonymous User"
          defaultMessage="Anonymous User"
        />
      )}</h1>
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
              className="text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-blog-white transition-colors"
            />
          </a>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
