// src/layouts/RootLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Theme from '../features/theme/Theme';
import Accent from '../features/accent/Accent';
import FontFamily from '../features/font-family/FontFamily';
import NavBar from '../components/NavBar';

const RootLayout = () => {
    return (
        <>
            <Theme />
            <Accent />
            <FontFamily />
            <NavBar />
            <Outlet /> {/* This is where nested routes will render their components */}
        </>
    );
};

export default RootLayout;
