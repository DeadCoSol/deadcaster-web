import { Loading } from "@components/ui/loading";
import { motion } from "framer-motion";
import { variants } from "@components/aside/aside-trends";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import React, { useEffect, useState } from "react";
import {UserAvatar} from '@components/user/user-avatar';

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
                <h2 className="text-xl font-bold">
                    <UserAvatar src='/steallie.png' alt='Fade' />
                    Streaming Now
                </h2>
                {playlist.length > 0 ? (
                    <>
                        <div className="text-light-primary dark:text-dark-primary">
                            {playlist[currentTrack]?.title} {/* Display the current track's title */}
                        </div>
                        <AudioPlayer
                            src={playlist[currentTrack]?.src}
                            showSkipControls
                            onClickNext={handleClickNext}
                            onEnded={handleEnd}
                            onError={() => console.log("Play error")}
                        />
                    </>
                ) : (
                    <Loading />
                )}
                <div className="text-light-primary dark:text-dark-primary">
                    From our @DeadCaster Audius archive
                </div>
            </motion.div>
        </section>
    );
}