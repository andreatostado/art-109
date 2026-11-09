const STORAGE = {
    posts: "puff-posts",
    saved: "puff-saved",
    follows: "puff-follows",
    profile: "puff-profile",
    messages: "puff-messages"
};
const page = new URLSearchParams(location.search).get("view") || "profile";
const content = document.querySelector("#view-content");
const dialog = document.querySelector("#app-dialog");
const dialogContent = document.querySelector("#dialog-content");
const commonWords = window.PUFF_COMMON_WORDS;

function blockedCaptionWords(text) {
    const words = text.toLowerCase().match(/[a-z]+/g) || [];
    return words.filter((word) => commonWords.has(word));
}

function readStore(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
        console.error(`Unable to read ${key} from local storage.`, error);
        return fallback;
    }
}

function writeStore(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Unable to save ${key} to local storage.`, error);
        return false;
    }
}

function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function showDialog(title, body) {
    dialogContent.replaceChildren();
    dialogContent.append(element("h2", "dialog-title", title));
    if (typeof body === "string") dialogContent.append(element("p", "dialog-copy", body));
    else dialogContent.append(body);
    if (!dialog.open) dialog.showModal();
}

const people = [
    { id: "hana", name: "hana’s happy place", handle: "@hanabear", image: "images/seal-stars.jpg", color: "avatar-hana", bio: "collecting flowers, soft moments & tiny joys 🌸" },
    { id: "coco", name: "coco’s cozy corner", handle: "@cocobunni", image: "images/seal-teacup.jpg", color: "avatar-coco", bio: "matcha enthusiast and professional daydreamer 🍵" },
    { id: "yuki", name: "yuki’s tiny world", handle: "@yukikitty", image: "images/seal-blue.jpg", color: "avatar-yuki", bio: "tiny adventures with my favorite people 🐾" },
    { id: "poppy", name: "poppy daydreams", handle: "@poppyday", image: "images/seal-ballon.jpg", color: "avatar-poppy", bio: "bringing a little sunshine wherever I go ☀️" },
    { id: "ren", name: "ren’s scrapbook", handle: "@berryren", image: "images/seal-watermelon.jpg", color: "avatar-ren", bio: "making ordinary days feel a bit magical 🍓" }
];

function addProfilePhoto(container, src, alt) {
    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    container.append(image);
}

function postCard(post) {
    const card = element("article", "view-post card");
    if (post.image) {
        const image = document.createElement("img");
        image.src = post.image;
        image.alt = post.alt || "A photo shared on puff";
        card.append(image);
    } else {
        card.append(element("div", "view-post-placeholder", "🦭 🫧 🦭"));
    }
    if (post.message) card.append(element("p", "post-copy", post.message));
    card.append(element("span", "view-post-date", "shared a little moment ♡"));
    return card;
}

function renderProfile() {
    const savedProfile = readStore(STORAGE.profile, {});
    const profile = {
        name: savedProfile.name || "mimi bloom",
        bio: savedProfile.bio || "making life a little softer, one tiny joy at a time 🌷",
        avatar: savedProfile.avatar || "images/seal-heart.jpg"
    };
    const user = new URLSearchParams(location.search).get("user");
    const other = people.find((person) => person.id === user);
    const target = other || profile;
    const posts = other ? [] : readStore(STORAGE.posts, []).filter((post) => !blockedCaptionWords(post.message || "").length).slice().reverse();
    const card = element("section", "profile-card card");
    const cover = element("div", "profile-cover");
    const info = element("div", "profile-info");
    const avatar = element("div", "profile-avatar");
    addProfilePhoto(avatar, other ? other.image : target.avatar, `${target.name} profile`);
    const details = element("div", "profile-details");
    details.append(element("h1", "", target.name), element("p", "profile-handle", other ? other.handle : "@mimibloom"));
    const actions = element("div", "profile-actions");
    if (!other) {
        const edit = element("button", "dialog-primary", "Edit profile");
        edit.type = "button";
        edit.dataset.editProfile = "";
        actions.append(edit);
    } else {
        const follow = element("button", "follow-button", "Follow");
        follow.type = "button";
        follow.dataset.follow = other.id;
        const followed = readStore(STORAGE.follows, []).includes(other.id);
        follow.setAttribute("aria-pressed", String(followed));
        follow.textContent = followed ? "Following" : "Follow";
        actions.append(follow);
    }
    details.append(actions);
    info.append(avatar, details);
    card.append(cover, info, element("p", "profile-bio", other ? other.bio : target.bio));
    const stats = element("div", "profile-stats");
    stats.append(element("span", "", `${posts.length} posts`), element("span", "", "248 friends"), element("span", "", "1.2k happy moments"));
    card.append(stats);
    content.replaceChildren(card);
    const heading = element("div", "view-section-heading");
    heading.append(element("h2", "", other ? "little moments" : "your little moments"), element("span", "", "♡"));
    content.append(heading);
    const grid = element("div", "profile-post-grid");
    if (posts.length) posts.forEach((post) => grid.append(postCard(post)));
    else if (!other) grid.append(element("p", "empty-state", "Your first post is waiting to bloom. Head back to the feed and share a little moment!"));
    else grid.append(element("p", "empty-state", "New little moments are on their way. ♡"));
    content.append(grid);
}

function renderDiscover() {
    const heading = element("div", "view-heading");
    heading.append(element("p", "eyebrow", "find your people"), element("h1", "", "A little more lovely ✨"), element("p", "view-subtitle", "Meet kind souls who make the internet feel like a hug."));
    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "Search people...";
    search.setAttribute("aria-label", "Search people");
    const searchWrap = element("label", "discover-search");
    searchWrap.append(element("span", "", "⌕"), search);
    const list = element("div", "discover-list");
    people.forEach((person) => {
        const card = element("article", "person-card card");
        const avatar = element("span", `avatar ${person.color}`);
        addProfilePhoto(avatar, person.image, `${person.name} profile`);
        const details = element("div", "suggestion-copy");
        details.append(element("strong", "", person.name), element("span", "", person.bio));
        const follow = element("button", "follow-button", "Follow");
        follow.type = "button";
        follow.dataset.follow = person.id;
        const following = readStore(STORAGE.follows, []).includes(person.id);
        follow.setAttribute("aria-pressed", String(following));
        follow.textContent = following ? "Following" : "Follow";
        const profileLink = element("a", "person-profile-link", "View profile →");
        profileLink.href = `view.html?view=profile&user=${person.id}`;
        card.append(avatar, details, follow, profileLink);
        list.append(card);
    });
    search.addEventListener("input", () => {
        const query = search.value.toLowerCase();
        [...list.children].forEach((item) => {
            item.hidden = !item.textContent.toLowerCase().includes(query);
        });
    });
    content.replaceChildren(heading, searchWrap, list);
}

function renderSaved() {
    const heading = element("div", "view-heading");
    heading.append(element("p", "eyebrow", "your keepsake box"), element("h1", "", "Saved with love ♡"), element("p", "view-subtitle", "Little things you wanted to come back to."));
    const ids = readStore(STORAGE.saved, []);
    const savedPosts = [...documentPosts(), ...readStore(STORAGE.posts, [])]
        .filter((post) => ids.includes(post.id) && !blockedCaptionWords(post.message || "").length);
    const grid = element("div", "saved-post-list");
    if (savedPosts.length) savedPosts.slice().reverse().forEach((post) => grid.append(postCard(post)));
    else grid.append(element("p", "empty-state card", "Your keepsake box is empty for now. Tap the ☆ on a post to save a little moment."));
    content.replaceChildren(heading, grid);
}

function documentPosts() {
    return [
        { id: "seed-flower", message: "snoozy fluffball ✨", image: "images/seal-blush.jpg" },
        { id: "seed-matcha", message: "plip-plop daydreams 🫧", image: "images/seal-dumpling.jpg" },
        { id: "seed-cupcake", message: "bloopberry bliss ✨", image: "images/seal-cupcake.jpg" },
        { id: "seed-watermelon", message: "snufflebean sparkle 🌷", image: "images/seal-watermelon.jpg" }
    ];
}

function renderMessages() {
    const heading = element("div", "view-heading");
    heading.append(element("p", "eyebrow", "a little note for you"), element("h1", "", "Messages ♡"), element("p", "view-subtitle", "Send a bit of kindness to your puff pals."));
    const layout = element("section", "messages-layout card");
    const list = element("div", "message-people");
    const thread = element("div", "message-thread");
    const peopleButtons = [];
    people.slice(0, 3).forEach((person, index) => {
        const button = element("button", `message-person${index === 0 ? " selected" : ""}`);
        button.type = "button";
        button.dataset.person = person.id;
        const avatar = element("span", `avatar ${person.color}`);
        addProfilePhoto(avatar, person.image, "");
        button.append(avatar, element("span", "suggestion-copy", person.name));
        button.addEventListener("click", () => {
            peopleButtons.forEach((item) => item.classList.remove("selected"));
            button.classList.add("selected");
            showThread(person, thread);
        });
        peopleButtons.push(button);
        list.append(button);
    });
    layout.append(list, thread);
    content.replaceChildren(heading, layout);
    showThread(people[0], thread);
}

function showThread(person, thread) {
    const threads = readStore(STORAGE.messages, {});
    const messages = threads[person.id] || [`hey, ${person.name.split("’")[0]} here! hope your day is feeling soft and lovely ☁️`];
    thread.replaceChildren();
    thread.append(element("h2", "", person.name));
    const history = element("div", "message-history");
    messages.forEach((message, index) => history.append(element("p", index === 0 ? "chat-bubble friend-bubble" : "chat-bubble self-bubble", message)));
    const form = document.createElement("form");
    form.className = "message-form";
    const input = document.createElement("input");
    input.name = "message";
    input.maxLength = 180;
    input.placeholder = "Write a sweet little note...";
    input.setAttribute("aria-label", "Write a message");
    const send = element("button", "dialog-primary", "Send ♡");
    send.type = "submit";
    form.append(input, send);
    thread.append(history, form);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = input.value.trim();
        if (!text) {
            input.focus();
            return;
        }
        const stored = readStore(STORAGE.messages, {});
        stored[person.id] = [...(stored[person.id] || messages), text];
        if (!writeStore(STORAGE.messages, stored)) {
            showDialog("Message couldn't send", "Your browser couldn't save that message. Please check your available storage.");
            return;
        }
        showThread(person, thread);
    });
}

content.addEventListener("click", (event) => {
    const follow = event.target.closest("[data-follow]");
    if (follow) {
        const follows = readStore(STORAGE.follows, []);
        const id = follow.dataset.follow;
        const following = follows.includes(id);
        const next = following ? follows.filter((person) => person !== id) : [...follows, id];
        follow.setAttribute("aria-pressed", String(!following));
        follow.textContent = following ? "Follow" : "Following";
        if (!writeStore(STORAGE.follows, next)) {
            showDialog("Couldn't update follows", "Your browser couldn't save this change. Please check your available storage.");
        }
    }
    if (event.target.closest("[data-edit-profile]")) {
        const current = readStore(STORAGE.profile, {});
        const form = document.createElement("form");
        form.className = "edit-profile-form";
        const name = document.createElement("input");
        name.name = "name";
        name.maxLength = 32;
        name.value = current.name || "mimi bloom";
        name.setAttribute("aria-label", "Your name");
        const bio = document.createElement("textarea");
        bio.name = "bio";
        bio.maxLength = 120;
        bio.value = current.bio || "making life a little softer, one tiny joy at a time 🌷";
        bio.setAttribute("aria-label", "Your bio");
        const save = element("button", "dialog-primary", "Save changes");
        save.type = "submit";
        form.append(element("label", "", "Your name"), name, element("label", "", "A little about you"), bio, save);
        showDialog("Make it yours ✿", form);
        form.addEventListener("submit", (submitEvent) => {
            submitEvent.preventDefault();
            if (!name.value.trim()) {
                name.focus();
                return;
            }
            if (!writeStore(STORAGE.profile, { name: name.value.trim(), bio: bio.value.trim() })) {
                showDialog("Couldn't save your profile", "Please check your browser's available storage and try again.");
                return;
            }
            dialog.close();
            renderProfile();
        });
    }
});

document.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
});

const navLink = document.querySelector(`.view-nav a[href="view.html?view=${page}"]`);
if (navLink) navLink.classList.add("active");

if (page === "discover") renderDiscover();
else if (page === "messages") renderMessages();
else if (page === "saved") renderSaved();
else renderProfile();
