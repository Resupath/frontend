import React, { FC, useEffect } from "react";
import Header from "./header";
import { Sidebar } from "./Sidebar";

/**
 * @author bkdragon
 * @function Home
 **/
const Home: FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    return (
        <div className="w-screen h-screen">
            <div className="w-full h-full flex flex-row">
                <Sidebar />
                <div className="w-full h-full flex flex-col">
                    <Header />
                    <div className="w-full flex-1 basis-0">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Home;
