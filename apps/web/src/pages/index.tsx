import React from "react";
import { ComingEventsList } from "@/components/organisms/ComingEventsList";

const Home: React.FC = () => {
    return (
        <div>
            <h1>Homepage</h1>
            <div className="mb-32 mt-16 w-[600px]">
                <h2 className="border-none mb-4">Arrangementer</h2>
                <ComingEventsList />
            </div>
        </div>
    );
};

export default Home;
