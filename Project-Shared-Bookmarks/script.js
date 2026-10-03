// This is a placeholder file which shows how you can access functions defined in other files.
// It can be loaded into index.html.
// You can delete the contents of the file once you have understood how it works.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

import { sortBookmarksNewestFirst } from "./bookmarks.js";
import { getUserIds, getData, setData } from "./storage.js";

window.onload = function () {
  const userSelect = document.querySelector("#user-select");
  const bookmarkForm = document.querySelector("#bookmark-form");
  const bookmarkList = document.querySelector("#bookmark-list");

  const urlInput = document.querySelector("#bookmark-url");
  const titleInput = document.querySelector("#bookmark-title");
  const descriptionInput = document.querySelector("#bookmark-description");

  // Display feedback without interrupting the user.
  const statusMessage = document.createElement("p");
  statusMessage.setAttribute("role", "status");
  bookmarkForm.after(statusMessage);

  // Create the five user options.
  for (const userId of getUserIds()) {
    const option = document.createElement("option");
    option.value = userId;
    option.textContent = `User ${userId}`;
    userSelect.appendChild(option);
  }

  // Clear validation messages when the user edits a field.
  for (const input of [urlInput, titleInput, descriptionInput]) {
    input.addEventListener("input", function () {
      input.setCustomValidity("");
    });
  }

 function renderBookmarks(userId) {
  const bookmarks = sortBookmarksNewestFirst(getData(userId) ?? []);

  bookmarkList.textContent = "";

    if (bookmarks.length === 0) {
      const message = document.createElement("li");
      message.textContent = "No bookmarks for this user yet.";
      bookmarkList.appendChild(message);
      return;
    }

    for (const bookmark of bookmarks) {
      const listItem = document.createElement("li");

      // Clickable title.
      const link = document.createElement("a");
      link.textContent = bookmark.title;
      link.href = bookmark.url;
      listItem.appendChild(link);

      // Description.
      const description = document.createElement("p");
      description.textContent = bookmark.description;
      listItem.appendChild(description);

      // Creation date and time.
      const timestamp = document.createElement("p");
      timestamp.textContent =
        `Created: ${new Date(bookmark.createdAt).toLocaleString()}`;
      listItem.appendChild(timestamp);

      // Copy URL button.
      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.textContent = "Copy URL";
      copyButton.setAttribute(
        "aria-label",
        `Copy URL for ${bookmark.title}`
      );

      copyButton.addEventListener("click", async function () {
        try {
          await navigator.clipboard.writeText(bookmark.url);
          statusMessage.textContent =
            `URL copied for "${bookmark.title}".`;
        } catch {
          statusMessage.textContent =
            `Could not copy automatically. Copy this URL: ${bookmark.url}`;
        }
      });

      listItem.appendChild(copyButton);

      // Like button and counter.
      const likeButton = document.createElement("button");
      likeButton.type = "button";

      function updateLikeButton() {
        const likes = bookmark.likes ?? 0;
        likeButton.textContent = `Like (${likes})`;
        likeButton.setAttribute(
          "aria-label",
          `Like ${bookmark.title}. ${likes} likes.`
        );
      }

      updateLikeButton();

      likeButton.addEventListener("click", function () {
        bookmark.likes = (bookmark.likes ?? 0) + 1;

        // Save the full array, including this bookmark's updated likes.
        setData(userId, bookmarks);
        updateLikeButton();

        statusMessage.textContent =
          `"${bookmark.title}" now has ${bookmark.likes} likes.`;
      });

      listItem.appendChild(likeButton);
      bookmarkList.appendChild(listItem);
    }
  }

  // Display the initially selected user's bookmarks.
  renderBookmarks(userSelect.value);

  // Update the list when the selected user changes.
  userSelect.addEventListener("change", function () {
    statusMessage.textContent = "";
    renderBookmarks(userSelect.value);
  });

  // Validate and save a new bookmark.
  bookmarkForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const selectedUserId = userSelect.value;
    const url = urlInput.value.trim();
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    urlInput.setCustomValidity("");
    titleInput.setCustomValidity("");
    descriptionInput.setCustomValidity("");

    if (url === "") {
      urlInput.setCustomValidity("Please enter a URL.");
    } else {
      try {
        const parsedUrl = new URL(url);

        if (
          parsedUrl.protocol !== "https:" &&
          parsedUrl.protocol !== "http:"
        ) {
          urlInput.setCustomValidity(
            "Use a URL starting with https:// or http://."
          );
        }
      } catch {
        urlInput.setCustomValidity(
          "Please enter a valid URL, such as https://example.com."
        );
      }
    }

    if (title === "") {
      titleInput.setCustomValidity("Please enter a title.");
    }

    if (description === "") {
      descriptionInput.setCustomValidity(
        "Please enter a description."
      );
    }

    // Show validation feedback and stop if any field is invalid.
    if (!bookmarkForm.reportValidity()) {
      return;
    }

    const bookmark = {
      url: new URL(url).href,
      title: title,
      description: description,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    const bookmarks = getData(selectedUserId) ?? [];
    bookmarks.push(bookmark);
    setData(selectedUserId, bookmarks);

    renderBookmarks(selectedUserId);
    bookmarkForm.reset();

    statusMessage.textContent =
      `Bookmark added for User ${selectedUserId}.`;
  });
};