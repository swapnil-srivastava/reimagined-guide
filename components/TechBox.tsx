function TechBox({techStackName, techStackColor}) {
    return (
        <div className={`font-mono px-5 py-2 m-1 text hover:rounded-2xl rounded-lg ${techStackColor ? techStackColor : `dark:text-blog-black bg-hit-pink-500 hover:bg-hit-pink-600`}`}>
            {techStackName}
        </div>
    );
}

export default TechBox;