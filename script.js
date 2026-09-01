// Import full color palettes
import { DATA } from './colors.js';

// Store the colors of the sections that have a nav property
const buttonColors = {};

// Track active section for navbar/back button highlights
let active = null;
let prev;

// Choose black or white label text based on the swatch's perceived brightness.
function textColor(hex) {
    // Extract RGB values from hex
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate relative luminance
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.5 ? "#1e2836" : "#ffffff";
}

// Copy hex color to clipboard
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

// Build page elements
function build() {
    const nav = document.querySelector("nav .inner");
    const main = document.querySelector("main");

    DATA.order.forEach((fam) => {
        const label = DATA.labels[fam];
        const colors = DATA.families[fam];

        // Nav link
        const div = document.createElement('div');
        div.id = "nav-" + fam;
        div.style.paddingBottom = "25px";
        const a = document.createElement("a");
        a.href = "#" + fam;
        a.textContent = label;
        div.appendChild(a);
        nav.appendChild(div);

        // Section
        const section = document.createElement("section");
        section.id = fam;

        // Calculate color count for current family
        const h2 = document.createElement("h2");
        h2.innerHTML = label + ' <span class="count">/ ' + colors.length + "</span>";
        section.appendChild(h2);

        // Divider line
        const rule = document.createElement("div");
        rule.className = "rule";
        section.appendChild(rule);

        // Initialize palette grid
        const grid = document.createElement("div");
        grid.className = "grid";

        colors.forEach((c) => {
            // Text (foreground) color
            const labelColor = textColor(c.hex);

            // Check if color has nav property, then apply to menu button
            if (c.nav) {
                a.style.background = c.hex;
                a.style.color = labelColor;
                // Store colors for back button
                buttonColors[fam] = { fg: labelColor, bg: c.hex };
            }

            // Create single color cell
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.style.background = c.hex;
            cell.style.color = labelColor;
            cell.title = "Click to copy " + c.hex;

            // Apply color name styling
            const name = document.createElement("div");
            name.className = "name";
            name.textContent = c.name;

            // Apply hex code styling
            const hex = document.createElement("div");
            hex.className = "hex";
            hex.textContent = c.hex;

            // Create "copied" confirmation text
            const copied = document.createElement("div");
            copied.className = "copied";
            copied.textContent = "copied " + c.hex;

            // Add to grid
            cell.append(name, hex, copied);
            cell.addEventListener("click", () => copyHex(c.hex, cell));
            grid.appendChild(cell);
        });

        section.appendChild(grid);
        main.appendChild(section);
    });
}

// Assign currently active section
function setActive(sectionId) {
    const btn = document.querySelector('.back-button');
    if (!btn) return;

    // Remove previous highlight
    if (active && prev) prev.classList.remove('active-section');
    active = sectionId;
    const activeSection = document.getElementById("nav-" + active);

    if (activeSection) {
        // Highlight new active section
        activeSection.classList.add('active-section');
        // Replace previous
        prev = activeSection;
    }

    // Highlight back button with current section color
    if (buttonColors[active]) {
        btn.style.color = buttonColors[active].fg;
        btn.style.backgroundColor = buttonColors[active].bg;
    }
}

// Initialize section observer
function initObserver() {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                // If section crosses the rootMargin, mark it as active
                if (entry.isIntersecting) {
                    setActive(entry.target.id);
                }
            });
        },
        {
            // We enter a section when it crosses the center of the viewport
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0,
        }
    );
    // Watch all sections
    sections.forEach((sec) => observer.observe(sec));
}

// Build page elements & setup section observer after DOM loads
document.addEventListener("DOMContentLoaded", () => {
    build();
    initObserver();
});
