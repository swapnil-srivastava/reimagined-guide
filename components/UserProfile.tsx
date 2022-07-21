import {
  faLinkedin,
  faTwitter,
  faGithub
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function UserProfile({user}) {

  return (
    <div className="flex flex-col items-center justify-center gap-2 dark:text-blog-white">
        <img src={user.photoURL || '/hacker.png'} className="card-img-center" />
            <p>
                <i>@{user.username}</i>
            </p>
        <h1>{user.displayName || 'Anonymous User'}</h1>
        {(user.displayName === "Swapnil Srivastava") ? (
          <div className="flex items-center justify-center gap-x-2">
            <a href="https://www.linkedin.com/in/swapnilsrivastava/"><FontAwesomeIcon icon={faLinkedin} size="2x" style={{ color: '#0072b1' }}/></a>
            <a href="https://twitter.com/swapnil_sri"><FontAwesomeIcon icon={faTwitter} size="2x" style={{ color: '#00acee' }}/></a>
            <a href="https://github.com/swapnil-srivastava"><FontAwesomeIcon icon={faGithub} size="2x" /></a>
          </div>
        ) : <></> }
    </div>
  )
}
