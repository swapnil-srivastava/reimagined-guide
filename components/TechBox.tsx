function TechBox({ techStackName, techStackColor, children }) {
    return (
        <div className={`flex flex-col items-center justify-center rounded-lg hover:rounded-2xl
                shadow-3xl ${children ? `h-auto` : `h-36 w-36`}
                ${techStackColor ? techStackColor : `dark:text-blog-black bg-hit-pink-500 hover:bg-hit-pink-600 border-hit-pink-800`}
                border-b-4       
                font-mono text text-center text-blog-black dark:text-blog-black 
                m-1
                `}>
            {children}
            <div className="px-2 pb-1">{techStackName}</div>
        </div>
    );
}

export default TechBox;