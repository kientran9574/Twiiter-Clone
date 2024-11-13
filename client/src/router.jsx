import React from 'react'
import {
    createBrowserRouter,
} from "react-router-dom";
import Home from './Home';
import Login from './Login';
const router = createBrowserRouter([
    {
        path: "/",
        element: <Home></Home>,
    },
    {
        path: "/login/oauth",
        element: <Login></Login>,
    },
]);

export default router