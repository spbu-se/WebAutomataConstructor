import React, {FC, useEffect, useState} from "react";
import "./PingPage.css";

interface PingPageProps {
}

const getCookie = (name: string) => {
    console.log(document.cookie);
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
}

const PingPage: FC<PingPageProps> = ({}) => {
    const [pong, setPong] = useState('ping...');


    useEffect(() => {
        const ping_domain = "https://sscss.ru:2102/ping";

        const fetch_init: RequestInit = {
            headers: new Headers({
                'tt': 'g',
                't': getCookie('token')!,
            }),
        };

        const fetchPong = async () => {
            const response = await fetch(ping_domain, fetch_init);
            const text = await response.text();

            setPong(text);
        }

        fetchPong().catch(err => console.log(err));
    });

    return (
        <div className='ping-page'>
            {pong}
        </div>
    )
};

export default PingPage;