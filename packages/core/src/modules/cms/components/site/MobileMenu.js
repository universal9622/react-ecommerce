import React from "react"
import { useAppState } from "../../../../lib/context/app"
import { get } from "../../../../lib/util/get"

export default function MobileMenu() {
    let items = get(useAppState(), "menuItems", []);
    return <div className="main-menu-mobile self-center">
        <a className='menu-icon' href="">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </a>
        <ul className="nav justify-content-center">
            {items.map((i, index) => {
                return <li className="nav-item" key={index}>
                    <a className="nav-link" href={i.url}>{i.name}</a>
                </li>
            })}
        </ul>
    </div>
}