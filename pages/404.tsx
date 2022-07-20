import Link from 'next/link';

export default function Custom404() {
  return (
    <main className='flex flex-col gap-y-10 items-center justify-center'>
      <h1>404 - That page does not seem to exist...</h1>
      <iframe
        src="https://giphy.com/embed/l2JehQ2GitHGdVG9y"
        width="480"
        height="362"
        frameBorder="0"
        allowFullScreen
      ></iframe>
      <Link href="/">
        <button className="
        bg-hit-pink-500 text-blog-black
        rounded-lg px-4 py-2 m-2
        transition-filter duration-500 hover:filter hover:brightness-125 
        focus:outline-none focus:ring-2 
        focus:ring-fun-blue-400 
        focus:ring-offset-2 text-sm
        font-semibold">Go home</button>
      </Link>
    </main>
  );
}