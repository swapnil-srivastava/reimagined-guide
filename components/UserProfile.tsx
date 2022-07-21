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
            <a target="_blank" href="https://www.linkedin.com/in/swapnilsrivastava/" rel="noreferrer"><FontAwesomeIcon icon={faLinkedin} size="2x" style={{ color: '#0072b1' }}/></a>
            <a target="_blank" href="https://twitter.com/swapnil_sri" rel="noreferrer"><FontAwesomeIcon icon={faTwitter} size="2x" style={{ color: '#00acee' }}/></a>
            <a target="_blank" href="https://github.com/swapnil-srivastava" rel="noreferrer"><FontAwesomeIcon icon={faGithub} size="2x" /></a>
          </div>
        ) : <></> }
    </div>
  )
}
