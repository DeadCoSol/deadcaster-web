import { Loading } from "@components/ui/loading";
import { motion } from "framer-motion";
import { variants } from "@components/aside/aside-trends";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import React, { useEffect, useState } from "react";
import {UserAvatar} from '@components/user/user-avatar';
import {FaSpinner} from 'react-icons/fa';

interface Song {
    src: string;
    title: string; // Include title in the Song interface
}

type Playlist = Song[];

export function MusicPlayer(): JSX.Element {
    // Maintain playlist as state
    const [playlist, setPlaylist] = useState<Playlist>([]);

    // State to track the current song index
    const [currentTrack, setTrackIndex] = useState(0);

    const handleClickNext = () => {
        setTrackIndex((prevIndex) =>
            prevIndex < playlist.length - 1 ? prevIndex + 1 : 0
        );
    };

    const handleEnd = () => {
        setTrackIndex((prevIndex) =>
            prevIndex < playlist.length - 1 ? prevIndex + 1 : 0
        );
    };

    // Fetch all DeadCaster songs from Audius
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(
                    "https://discoveryprovider.audius.co/v1/users/handle/deadcaster/tracks?app_name=DeadCasterApp"
                );
                const json = await response.json();

                // Map the response to a new playlist
                const newPlaylist = json.data.map((item: any) => ({
                    src: `https://discoveryprovider.audius.co/v1/tracks/${item.id}/stream?app_name=DeadCasterApp`,
                    title: item.title.split(".")[1], // Capture the track's title
                }));

                // Update the playlist state
                setPlaylist(newPlaylist);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        }

        fetchData();
    }, []);

    return (
        <section className="hover-animation rounded-2xl bg-main-sidebar-background">
            <motion.div className="inner:px-4 inner:py-3" {...variants}>
                <div className="flex justify-between items-center p-2">
                    <div className="flex items-center w-1/5">
                        <img src="/logo192.jpeg" alt="stream" className="w-14 h-14 rounded-full" />
                    </div>
                    <div className="flex gap-10 w-4/5 justify-left"> {/* Adjusted gap to 4 for more spacing */}
                        <span className="text-xl font-bold">Stream Now</span>
                    </div>
                </div>
                {playlist.length > 0 ? (
                    <div className="mr-2">
                        <div className="text-light-primary dark:text-dark-primary mb-1 text-xl font-bold">
                            {playlist[currentTrack]?.title.split(",")[0] } {/* Display the current track's title */}
                        </div>
                        <div className="text-light-secondary dark:text-dark-secondary mb-2">
                            {playlist[currentTrack]?.title.split(",")[1] +
                                ' ('+ playlist[currentTrack]?.title.split(",")[2].trim() + ')'} {/* Display the current track's title */}
                        </div>
                        <AudioPlayer
                            src={playlist[currentTrack]?.src}
                            showSkipControls
                            onClickNext={handleClickNext}
                            onEnded={handleEnd}
                            onError={() => console.log("Play error")}
                        />
                    </div>
                ) : (
                    <Loading />
                )}
                <div className="text-light-primary dark:text-dark-primary">
                    From the archive.
                </div>
            </motion.div>
        </section>
    );
}