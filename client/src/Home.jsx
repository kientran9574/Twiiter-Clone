import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Link } from 'react-router-dom'
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
const getUrlOauthGoogle = () => {
    const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI } = import.meta.env
    const url = `https://accounts.google.com/o/oauth2/v2/auth`
    const query = {
        client_id: VITE_GOOGLE_CLIENT_ID,
        redirect_uri: VITE_GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ].join(' '),
        prompt: 'consent',
        access_type: 'offline'
    }
    const queryParams = new URLSearchParams(query).toString()
    return `${url}?${queryParams}`
}
const googleOAuthUrl = getUrlOauthGoogle()

const Home = () => {
    return (
        <div className='center'>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <Link to={googleOAuthUrl}>
                    Login with google
                </Link>

            </div>
            <h2>Upload Video basic</h2>
            {/* <video controls width={500}>
                <source
                    src='http://localhost:4000/static/video/097c2c2eefbc934766f381a00.mp4'
                    type='video/mp4'
                />
            </video> */}
            <h2>Upload Video HLS</h2>
            <MediaPlayer title="Sprite Fight" src="http://localhost:4000/static/video-hls/fYDfV6VdeBudqOnFJFhLD/master.m3u8" controls>
                <MediaProvider />
                <DefaultVideoLayout thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" icons={defaultLayoutIcons} controlsAlwaysVisible={true} />
            </MediaPlayer>
        </div>

    )
}

export default Home