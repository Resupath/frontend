import React, { FC, useEffect } from "react";
import Header from "./header";

/**
 * @author bkdragon
 * @function Home
 **/
const Home: FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    return (
        <>
            <Header />
            {children}
        </>
    );
};

export default Home;
