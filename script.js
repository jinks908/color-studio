import { DATA } from './colors.js';

// Store the colors of the sections that have a nav property
const buttonColors = {};

// Choose black or white label text based on the swatch's perceived brightness.
function textColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // relative luminance (sRGB-ish, good enough for contrast choice)
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.5 ? "#12161f" : "#ffffff";
}

function copyHex(hex, cell) {
    const done = () => {
        cell.classList.add("flash");
        setTimeout(() => cell.classList.remove("flash"), 650);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hex).then(done).catch(() => fallbackCopy(hex, done));
    } else {
        fallbackCopy(hex, done);
    }
}

// Clipboard API is unavailable over file:// in some browsers; fall back to execCommand.
function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* no-op */ }
    document.body.removeChild(ta);
    done();
}

function build() {
    const nav = document.querySelector("nav .inner");
    const main = document.querySelector("main");

    DATA.order.forEach((fam) => {
        const label = DATA.labels[fam];
        const colors = DATA.families[fam];

        // nav link
        const a = document.createElement("a");
        a.href = "#" + fam;
        a.textContent = label;
        nav.appendChild(a);

        // section
        const section = document.createElement("section");
        section.id = fam;

        const h2 = document.createElement("h2");
        h2.innerHTML = label + ' <span class="count">/ ' + colors.length + "</span>";
        section.appendChild(h2);

        const rule = document.createElement("div");
        rule.className = "rule";
        section.appendChild(rule);

        const grid = document.createElement("div");
        grid.className = "grid";

        colors.forEach((c) => {
            const labelColor = textColor(c.hex);
            // Check if color has nav property, then apply
            if (c.nav) {
                a.style.background = c.hex;
                a.style.color = labelColor;
                buttonColors[fam] = { fg: labelColor, bg: c.hex };
            }
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.style.background = c.hex;
            cell.style.color = labelColor;
            cell.title = "Click to copy " + c.hex;

            const name = document.createElement("div");
            name.className = "name";
            name.textContent = c.name;

            const hex = document.createElement("div");
            hex.className = "hex";
            hex.textContent = c.hex;

            const copied = document.createElement("div");
            copied.className = "copied";
            copied.textContent = "copied " + c.hex;

            cell.append(name, hex, copied);
            cell.addEventListener("click", () => copyHex(c.hex, cell));
            grid.appendChild(cell);
        });

        section.appendChild(grid);
        main.appendChild(section);
    });
}

function updateColor() {
    const btn = document.querySelector('.back-button');
    const sections = document.querySelectorAll('section');
    const navbar = document.querySelector("nav");
    let active;

    // Midpoint of viewport
    const scrollY = window.scrollY + window.innerHeight / 2;

    // Loop through sections
    sections.forEach((sec, name) => {
        const currentSection = sec.id;

        // Remove border highlight from current section
        navbar.querySelector(`a[href="#${currentSection}"]`).classList.remove('active-section');
        // Mark active section if we're past its heading.
        // Since we're traversing sections from top to bottom, `active` will
        // end up with the section we're currently in.
        if (scrollY >= sec.offsetTop) {
            active = currentSection;
        }
    });
    if (active) {
        // Find the active section and highlight border
        const activeSection = navbar.querySelector(`a[href="#${active}"]`)
        if (activeSection) activeSection.classList.add('active-section');

        // Update back button colors w/ active section highlight
        btn.style.color = buttonColors[active].fg;
        btn.style.backgroundColor = buttonColors[active].bg;
    }
}

window.addEventListener('scroll', updateColor);
window.addEventListener('resize', updateColor);
updateColor();

document.addEventListener("DOMContentLoaded", build);
