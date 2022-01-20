import React from "react";
import { NavLink } from "react-router-dom";

function Navigation() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="collapse navbar-collapse" id="navbarText">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item active">
                        <NavLink className="nav-link" to="/trainer_helper">
                            Trainer helper
                            <span className="sr-only"></span>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/dataset_viewer">
                            Dataset viewer
                        </NavLink>
                    </li>
                </ul>
                
            </div>
        </nav>
    )
}

export default Navigation;