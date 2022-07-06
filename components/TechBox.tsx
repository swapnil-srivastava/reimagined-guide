function TechBox({techStackName}) {
    return (
        <div className="font-mono px-5 py-2 m-1 text dark:text-blog-black  bg-hit-pink-500 hover:bg-hit-pink-600 hover:rounded-2xl rounded-lg">
            {techStackName}
        </div>
    );
}

export default TechBox;