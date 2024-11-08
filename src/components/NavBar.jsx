// src/components/NavBar.jsx
import { Link, useLocation } from 'react-router-dom';

function NavBar() {
    const location = useLocation(); // Get current route to apply active styles

    return (
        <nav className="fixed top-0 w-full z-50 text-text bg-mantle p-4 text-xl space-x-5 font-semibold">
            {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/videos", label: "Videos" },
                { to: "/view", label: "View" },
                { to: "/settings", label: "Settings" },
            ].map((link) => {
                const isActive = location.pathname === link.to;

                return (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`relative group transition-all duration-200
                                    ${isActive ? 'text-accent' : 'hover:text-accent'} 
                                    ${isActive ? 'scale-100' : 'hover:scale-95 active:scale-110'}`}
                    >
                        {link.label}
                        {/* Custom underline effect */}
                        <span
                            className={`absolute left-1/2 -bottom-1 h-[2px] bg-accent transition-all duration-300 transform -translate-x-1/2 
                                        ${isActive ? 'w-full' : 'w-0 group-hover:w-4/5 group-active:w-full'}`}
                        />
                    </Link>
                );
            })}
        </nav>
    );
}

export default NavBar;
