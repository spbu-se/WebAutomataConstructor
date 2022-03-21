import React, {FC, useEffect, useState} from "react";
import "./PingPage.css";
import pingApi from "../../../Api/pingApi";

interface PingPageProps {
}

const PingPage: FC<PingPageProps> = ({}) => {
    const [pong, setPong] = useState('ping...');

    const ping = async (): Promise<string | null> => {
        let pong = null;

        try {
            const response = await pingApi();
            pong = response.pong;
        } catch (error) {
            console.error(error);
        }

        return pong;
    }

    useEffect(() => {
        ping().then(pong => setPong(pong ?? "Failed to ping"));
    });

    return (
        <div className='ping-page'>
            {pong}
        </div>
    )
};

export default PingPage;