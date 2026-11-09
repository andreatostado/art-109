const STORAGE = {
    posts: "puff-posts",
    likes: "puff-likes",
    saved: "puff-saved",
    follows: "puff-follows",
    stories: "puff-stories",
    comments: "puff-comments",
    profile: "puff-profile"
};

const composer = document.querySelector("#composer");
const messageInput = document.querySelector("#post-message");
const imageInput = document.querySelector("#post-image");
const storyInput = document.querySelector("#story-image");
const postsContainer = document.querySelector(".posts");
const dialog = document.querySelector("#app-dialog");
const dialogContent = document.querySelector("#dialog-content");
const postStatus = document.querySelector("#post-message-status");
const commonWords = window.PUFF_COMMON_WORDS;
let pendingPostImage = "";

function blockedCaptionWords(text) {
    const words = text.toLowerCase().match(/[a-z]+/g) || [];
    return words.filter((word) => commonWords.has(word));
}

function readStore(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
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

function currentProfileName() {
    return readStore(STORAGE.profile, {}).name || "mimi bloom";
}

function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function showDialog(title, body) {
    dialogContent.replaceChildren();
    if (title) dialogContent.append(makeElement("h2", "dialog-title", title));
    if (typeof body === "string") {
        dialogContent.append(makeElement("p", "dialog-copy", body));
    } else if (body) {
        dialogContent.append(body);
    }
    if (!dialog.open) dialog.showModal();
}

function postCard(post) {
    const article = makeElement("article", "post-card card");
    article.id = post.id;
    article.dataset.postId = post.id;

    const header = makeElement("div", "post-header");
    const avatar = makeElement("span", "avatar avatar-self");
    const profileImage = document.createElement("img");
    profileImage.src = "images/seal-heart.jpg";
    profileImage.alt = "";
    avatar.append(profileImage);
    const author = makeElement("div", "post-author");
    author.append(makeElement("strong", "", post.author || "mimi bloom"));
    author.append(makeElement("span", "", "@mimibloom · just now"));
    const more = makeElement("button", "more-button", "•••");
    more.type = "button";
    more.setAttribute("aria-label", "More options");
    header.append(avatar, author, more);

    const content = [];
    if (post.message) content.push(makeElement("p", "post-copy", post.message));
    if (post.image) {
        const figure = makeElement("figure", "post-media");
        figure.append(makeElement("div", "photo-fallback", "your little moment ♡"));
        const image = document.createElement("img");
        image.src = post.image;
        image.alt = post.alt || "Photo shared by mimi bloom";
        figure.append(image);
        const sticker = makeElement("span", "image-sticker", "♡");
        sticker.setAttribute("aria-hidden", "true");
        figure.append(sticker);
        content.push(figure);
    }

    const actions = makeElement("div", "post-actions");
    const like = makeElement("button", "action-button like-button");
    like.type = "button";
    like.setAttribute("aria-label", "Like post");
    like.setAttribute("aria-pressed", "false");
    like.append(makeElement("span", "", "♡"), makeElement("span", "like-count", "0"));
    const comment = makeElement("button", "action-button comment-button");
    comment.type = "button";
    comment.setAttribute("aria-label", "Comment");
    comment.append(makeElement("span", "", "☏"), makeElement("span", "", "0"));
    const share = makeElement("button", "action-button share-button");
    share.type = "button";
    share.setAttribute("aria-label", "Share");
    share.append(makeElement("span", "", "↗"));
    const save = makeElement("button", "action-button save-button");
    save.type = "button";
    save.setAttribute("aria-label", "Save post");
    save.setAttribute("aria-pressed", "false");
    save.append(makeElement("span", "", "☆"));
    actions.append(like, comment, share, save);
    article.append(header, ...content, actions);
    return article;
}

function renderStoredPosts() {
    const allPosts = readStore(STORAGE.posts, []);
    const posts = allPosts.filter((post) => !blockedCaptionWords(post.message || "").length);
    if (posts.length !== allPosts.length) {
        postStatus.textContent = "Some older captions are hidden because they use words from the common-word list.";
    }
    posts.slice().reverse().forEach((post) => postsContainer.prepend(postCard(post)));
}

function restoreButtonStates() {
    const likes = readStore(STORAGE.likes, {});
    const saved = readStore(STORAGE.saved, []);
    const follows = readStore(STORAGE.follows, []);
    const comments = readStore(STORAGE.comments, {});
    document.querySelectorAll(".like-button").forEach((button) => {
        const id = button.closest("[data-post-id]")?.dataset.postId;
        if (id && likes[id]) {
            button.setAttribute("aria-pressed", "true");
            button.setAttribute("aria-label", "Unlike post");
            const count = button.querySelector(".like-count");
            if (count) count.textContent = String(Number(count.textContent) + 1);
        }
    });
    document.querySelectorAll(".save-button").forEach((button) => {
        const id = button.closest("[data-post-id]")?.dataset.postId;
        const isSaved = id && saved.includes(id);
        button.setAttribute("aria-pressed", String(Boolean(isSaved)));
        button.setAttribute("aria-label", isSaved ? "Remove saved post" : "Save post");
        button.querySelector("span").textContent = isSaved ? "★" : "☆";
    });
    document.querySelectorAll(".comment-button").forEach((button) => {
        const id = button.closest("[data-post-id]")?.dataset.postId;
        const count = button.querySelector("span:last-child");
        if (id && count) count.textContent = String(Number(count.textContent) + (comments[id] || []).length);
    });
    document.querySelectorAll(".follow-button").forEach((button) => {
        const following = follows.includes(button.dataset.follow);
        button.setAttribute("aria-pressed", String(following));
        button.textContent = following ? "Following" : "Follow";
    });
}

function renderUploadedStories() {
    const stories = readStore(STORAGE.stories, []).filter((story) => story.expiresAt > Date.now() && !blockedCaptionWords(story.caption || "").length);
    writeStore(STORAGE.stories, stories);
    const row = document.querySelector(".stories-row");
    stories.forEach((story) => {
        const button = makeElement("button", "story uploaded-story");
        button.type = "button";
        button.dataset.uploadedStory = story.id;
        button.setAttribute("aria-label", `View ${story.name}'s story`);
        const ring = makeElement("span", "story-ring ring-lilac");
        const avatar = makeElement("span", "story-avatar story-photo-avatar");
        const image = document.createElement("img");
        image.src = story.image;
        image.alt = "";
        avatar.append(image);
        ring.append(avatar);
        button.append(ring, makeElement("span", "story-name", story.name));
        row.append(button);
    });
}

function openStory(name, text, image) {
    const viewer = makeElement("div", "story-viewer");
    if (image) {
        const photo = document.createElement("img");
        photo.src = image;
        photo.alt = `Story photo from ${name}`;
        viewer.append(photo);
    }
    viewer.append(makeElement("strong", "story-viewer-name", name));
    viewer.append(makeElement("p", "story-viewer-text", text));
    showDialog("", viewer);
}

function compressImage(file) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("Choose an image file to continue."));
            return;
        }
        if (file.size > 12 * 1024 * 1024) {
            reject(new Error("That image is too large. Please choose a photo under 12 MB."));
            return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("We couldn't read that image. Please try another file."));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error("We couldn't open that image. Please try another file."));
            image.onload = () => {
                const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
                canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
                const context = canvas.getContext("2d");
                if (!context) {
                    reject(new Error("Your browser couldn't prepare the image. Please try another browser."));
                    return;
                }
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.78));
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function showPostPreview(imageData) {
    const preview = document.querySelector("#post-preview");
    preview.replaceChildren();
    preview.hidden = false;
    const image = document.createElement("img");
    image.src = imageData;
    image.alt = "Selected post photo preview";
    const remove = makeElement("button", "preview-remove", "Remove photo ×");
    remove.type = "button";
    remove.addEventListener("click", () => {
        pendingPostImage = "";
        imageInput.value = "";
        preview.hidden = true;
        preview.replaceChildren();
    });
    preview.append(image, remove);
}

document.querySelectorAll("[data-focus-composer]").forEach((button) => {
    button.addEventListener("click", () => {
        messageInput.focus();
        composer.scrollIntoView({ behavior: "smooth", block: "center" });
    });
});

document.querySelectorAll("[data-add-story]").forEach((button) => {
    button.addEventListener("click", () => storyInput.click());
});

storyInput.addEventListener("change", async () => {
    const file = storyInput.files[0];
    if (!file) return;
    try {
        const image = await compressImage(file);
        const form = document.createElement("form");
        form.className = "story-composer";
        const preview = document.createElement("img");
        preview.src = image;
        preview.alt = "Your story photo preview";
        const caption = document.createElement("input");
        caption.name = "caption";
        caption.maxLength = 100;
        caption.placeholder = "Add a little caption...";
        caption.setAttribute("aria-label", "Story caption");
        const captionNotice = makeElement("p", "form-message");
        captionNotice.setAttribute("role", "status");
        const submit = makeElement("button", "dialog-primary", "Share your story ♡");
        submit.type = "submit";
        form.append(preview, caption, captionNotice, submit);
        caption.addEventListener("input", () => {
            captionNotice.textContent = "";
        });
        showDialog("Your little moment", form);
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const storyCaption = caption.value.trim();
            if (blockedCaptionWords(storyCaption).length) {
                captionNotice.textContent = "This caption uses words from the common-word list. Please rephrase it.";
                caption.focus();
                return;
            }
            const stories = readStore(STORAGE.stories, []).filter((story) => story.expiresAt > Date.now());
            const story = {
                id: `story-${Date.now()}`,
                name: currentProfileName().split(/\s+/)[0],
                image,
                caption: storyCaption || "snoozy fluffball ✨",
                expiresAt: Date.now() + 24 * 60 * 60 * 1000
            };
            stories.push(story);
            if (!writeStore(STORAGE.stories, stories)) {
                showDialog("Almost there!", "Your browser couldn't save this story. Try a smaller image or clear some browser storage.");
                return;
            }
            dialog.close();
            renderUploadedStories();
            openStory(story.name, story.caption, story.image);
        });
    } catch (error) {
        showDialog("Photo couldn't be added", error.message);
    } finally {
        storyInput.value = "";
    }
});

imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];
    if (!file) return;
    postStatus.textContent = "Getting your photo ready...";
    try {
        pendingPostImage = await compressImage(file);
        showPostPreview(pendingPostImage);
        postStatus.textContent = "Your photo is ready to post ♡";
    } catch (error) {
        pendingPostImage = "";
        postStatus.textContent = error.message;
    } finally {
        imageInput.value = "";
    }
});

composer.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = messageInput.value.trim();
    if (!message && !pendingPostImage) {
        postStatus.textContent = "Add a caption or a photo before posting ♡";
        messageInput.focus();
        return;
    }
    if (blockedCaptionWords(message).length) {
        postStatus.textContent = "That caption uses words from the common-word list. Please rephrase it.";
        messageInput.focus();
        return;
    }

    const post = {
        id: `post-${Date.now()}`,
        author: currentProfileName(),
        message,
        image: pendingPostImage,
        createdAt: Date.now()
    };
    const storedPosts = readStore(STORAGE.posts, []);
    storedPosts.push(post);
    if (!writeStore(STORAGE.posts, storedPosts)) {
        postStatus.textContent = "Your post couldn't be saved. Try a smaller photo or clear some browser storage.";
        return;
    }

    postsContainer.prepend(postCard(post));
    messageInput.value = "";
    pendingPostImage = "";
    document.querySelector("#post-preview").hidden = true;
    document.querySelector("#post-preview").replaceChildren();
    postStatus.textContent = "Your little moment is on the feed ♡";
});

document.addEventListener("click", async (event) => {
    const like = event.target.closest(".like-button");
    const save = event.target.closest(".save-button");
    const follow = event.target.closest(".follow-button");
    const story = event.target.closest("[data-story-name], [data-uploaded-story]");
    const comment = event.target.closest(".comment-button");
    const share = event.target.closest(".share-button");
    const more = event.target.closest(".more-button");

    if (like) {
        const card = like.closest("[data-post-id]");
        const id = card.dataset.postId;
        const likes = readStore(STORAGE.likes, {});
        const liked = like.getAttribute("aria-pressed") === "true";
        like.setAttribute("aria-pressed", String(!liked));
        like.setAttribute("aria-label", liked ? "Like post" : "Unlike post");
        const count = like.querySelector(".like-count");
        count.textContent = String(Math.max(0, Number(count.textContent) + (liked ? -1 : 1)));
        if (liked) delete likes[id];
        else likes[id] = true;
        if (!writeStore(STORAGE.likes, likes)) showDialog("Couldn't save your like", "Your browser couldn't save this change. Please check your available storage.");
    } else if (save) {
        const id = save.closest("[data-post-id]").dataset.postId;
        const saved = readStore(STORAGE.saved, []);
        const isSaved = saved.includes(id);
        const next = isSaved ? saved.filter((savedId) => savedId !== id) : [...saved, id];
        save.setAttribute("aria-pressed", String(!isSaved));
        save.setAttribute("aria-label", isSaved ? "Save post" : "Remove saved post");
        save.querySelector("span").textContent = isSaved ? "☆" : "★";
        if (!writeStore(STORAGE.saved, next)) showDialog("Couldn't save that", "Your browser couldn't update saved posts. Please check your available storage.");
    } else if (follow) {
        const follows = readStore(STORAGE.follows, []);
        const id = follow.dataset.follow;
        const following = follows.includes(id);
        const next = following ? follows.filter((person) => person !== id) : [...follows, id];
        follow.setAttribute("aria-pressed", String(!following));
        follow.textContent = following ? "Follow" : "Following";
        if (!writeStore(STORAGE.follows, next)) showDialog("Couldn't update follows", "Your browser couldn't save this change. Please check your available storage.");
    } else if (story) {
        if (story.dataset.uploadedStory) {
            const savedStory = readStore(STORAGE.stories, []).find((item) => item.id === story.dataset.uploadedStory);
            if (savedStory) openStory(savedStory.name, savedStory.caption, savedStory.image);
        } else {
            openStory(story.dataset.storyName, story.dataset.storyText, "");
        }
    } else if (comment) {
        const card = comment.closest("[data-post-id]");
        const postId = card.dataset.postId;
        const comments = readStore(STORAGE.comments, {});
        const list = makeElement("div", "comment-list");
        (comments[postId] || []).forEach((text) => list.append(makeElement("p", "comment-item", text)));
        const form = document.createElement("form");
        form.className = "comment-form";
        const input = document.createElement("input");
        input.name = "comment";
        input.maxLength = 180;
        input.placeholder = "Write a kind comment...";
        input.setAttribute("aria-label", "Write a comment");
        const send = makeElement("button", "dialog-primary", "Send");
        send.type = "submit";
        form.append(input, send);
        const body = makeElement("div", "comment-content");
        body.append(list, form);
        showDialog("Leave a little love ♡", body);
        input.focus();
        form.addEventListener("submit", (submitEvent) => {
            submitEvent.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            const current = readStore(STORAGE.comments, {});
            current[postId] = [...(current[postId] || []), text];
            if (!writeStore(STORAGE.comments, current)) {
                showDialog("Couldn't save your comment", "Your browser couldn't save this comment. Please try again.");
                return;
            }
            const count = comment.querySelector("span:last-child");
            count.textContent = String(Number(count.textContent) + 1);
            list.append(makeElement("p", "comment-item", text));
            input.value = "";
        });
    } else if (share) {
        const url = new URL(window.location.href);
        url.hash = share.closest("[data-post-id]").dataset.postId;
        try {
            if (navigator.share) {
                await navigator.share({ title: "A little moment on puff", url: url.href });
            } else if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url.href);
                showDialog("Link copied ♡", "Share this little moment with someone you love.");
            } else {
                const input = document.createElement("input");
                input.value = url.href;
                input.readOnly = true;
                input.setAttribute("aria-label", "Post link");
                showDialog("Share a little moment", input);
                input.select();
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Unable to share post.", error);
                showDialog("Couldn't share right now", "Please try copying the page link from your browser.");
            }
        }
    } else if (more) {
        const card = more.closest("[data-post-id]");
        const body = document.createElement("div");
        const hide = makeElement("button", "dialog-action", "Hide this post");
        hide.type = "button";
        hide.addEventListener("click", () => {
            card.remove();
            dialog.close();
        });
        const report = makeElement("button", "dialog-action", "Report post");
        report.type = "button";
        report.addEventListener("click", () => showDialog("Thanks for looking out ♡", "This post has been reported for review."));
        body.append(hide, report);
        showDialog("Post options", body);
    } else if (event.target.closest("[data-sort-posts]")) {
        const button = event.target.closest("[data-sort-posts]");
        const reversed = button.dataset.sorted === "recent";
        const cards = [...postsContainer.children];
        cards.reverse().forEach((card) => postsContainer.append(card));
        button.dataset.sorted = reversed ? "for-you" : "recent";
        button.innerHTML = `${reversed ? "For you" : "Most recent"} <span aria-hidden="true">⌄</span>`;
    } else if (event.target.closest("[data-premium]")) {
        showDialog("A little extra sparkle ✧", "Puff is your cozy, ad-free corner. Premium goodies are coming soon!");
    }
});

postsContainer.addEventListener("error", (event) => {
    if (event.target instanceof HTMLImageElement) {
        event.target.closest(".post-media")?.classList.add("image-missing");
    }
}, true);

document.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
});

renderStoredPosts();
renderUploadedStories();
restoreButtonStates();
const profileName = document.querySelector(".profile-link strong");
if (profileName) profileName.textContent = currentProfileName();
