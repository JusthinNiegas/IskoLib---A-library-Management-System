    const viewContent = {
      dashboard: {
        title: "Dashboard",
        description: {
          admin: "A quick overview of the library collection.",
          student: "Your personal library overview."
        }
      },
      books: {
        title: "Book Management",
        description: "Browse the collection and manage book records."
      },
      students: {
        title: "Student Management",
        description: "View student records in the library community."
      },
      "add-book": {
        title: "Add Book",
        description: "Add a new title to the library collection."
      },
      return: {
        title: "Return Books",
        description: "Review books currently checked out."
      },
      "search-books": {
        title: "Search Books",
        description: "Explore titles available in the library collection."
      },
      "my-borrowed": {
        title: "My Borrowed Books",
        description: "View your current loans and due dates."
      }
    };

    const loginScreen = document.querySelector("#login-screen");
    const loginForm = document.querySelector("#login-form");
    const loginUsername = document.querySelector("#login-username");
    const loginPassword = document.querySelector("#login-password");
    const loginRole = document.querySelector("#login-role");
    const appContainer = document.querySelector("#app-container");
    const logoutButton = document.querySelector("#logout-button");
    const navigationButtons = [...document.querySelectorAll(".nav-link[data-navigate]")];
    const viewTitle = document.querySelector("#view-title");
    const viewDescription = document.querySelector("#view-description");
    const dashboardWelcomeName = document.querySelector("#dashboard-welcome-name");
    let activeView = "dashboard";
    let userRole = null;
    let isNavigating = false;

    function setNavigationBusy(busy) {
      navigationButtons.forEach((button) => {
        button.disabled = busy;
      });
      logoutButton.disabled = busy;
    }

    function playTransition(element, className, duration = 400) {
      return new Promise((resolve) => {
        const finish = () => {
          clearTimeout(timeoutId);
          element.removeEventListener("animationend", onAnimationEnd);
          element.classList.remove(className);
          resolve();
        };
        const onAnimationEnd = (event) => {
          if (event.target === element) finish();
        };
        const timeoutId = setTimeout(finish, duration);

        element.addEventListener("animationend", onAnimationEnd);
        element.classList.add(className);
      });
    }

    function canAccessView(viewName) {
      return userRole === "admin"
        ? ["dashboard", "books", "students", "add-book", "return"].includes(viewName)
        : ["dashboard", "search-books", "my-borrowed"].includes(viewName);
    }

    function updateRoleInterface() {
      document.querySelectorAll("[data-role]").forEach((element) => {
        element.hidden = element.dataset.role !== userRole;
      });

      navigationButtons.forEach((button) => {
        button.removeAttribute("aria-current");
        if (button.dataset.role === userRole && button.dataset.navigate === "dashboard") {
          button.setAttribute("aria-current", "page");
        }
      });

      viewTitle.textContent = "Dashboard";
      viewDescription.textContent = viewContent.dashboard.description[userRole];
      document.querySelectorAll(".view").forEach((view) => {
        view.hidden = view.id !== "view-dashboard";
      });
      activeView = "dashboard";
    }

    async function navigateTo(viewName) {
      if (!viewContent[viewName] || !canAccessView(viewName) || viewName === activeView || isNavigating) return;
      isNavigating = true;
      setNavigationBusy(true);

      const currentSection = document.querySelector(`#view-${activeView}`);
      const nextSection = document.querySelector(`#view-${viewName}`);

      await playTransition(currentSection, "is-leaving");
      currentSection.hidden = true;
      nextSection.hidden = false;
      viewTitle.textContent = viewContent[viewName].title;
      viewDescription.textContent = typeof viewContent[viewName].description === "string"
        ? viewContent[viewName].description
        : viewContent[viewName].description[userRole];

      navigationButtons.forEach((button) => {
        if (button.dataset.navigate === viewName) {
          button.setAttribute("aria-current", "page");
        } else {
          button.removeAttribute("aria-current");
        }
      });

      await playTransition(nextSection, "is-entering");
      activeView = viewName;
      isNavigating = false;
      setNavigationBusy(false);
    }

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isNavigating) return;

      isNavigating = true;
      setNavigationBusy(true);
      userRole = loginRole.value;
      const enteredName = loginUsername.value.trim();
      dashboardWelcomeName.textContent = enteredName || (userRole === "student" ? "Student" : "Isko");
      updateRoleInterface();

      await playTransition(loginScreen, "screen-leaving", 250);
      loginScreen.hidden = true;
      appContainer.hidden = false;
      await playTransition(appContainer, "screen-entering", 300);
      isNavigating = false;
      setNavigationBusy(false);
    });

    logoutButton.addEventListener("click", async () => {
      if (isNavigating || !userRole) return;

      isNavigating = true;
      setNavigationBusy(true);
      await playTransition(appContainer, "screen-leaving", 250);
      appContainer.hidden = true;
      loginScreen.hidden = false;
      loginPassword.value = "";
      userRole = null;
      await playTransition(loginScreen, "screen-entering", 300);
      loginUsername.focus();
      isNavigating = false;
      setNavigationBusy(false);
    });

    document.addEventListener("click", (event) => {
      const navigationTarget = event.target.closest("[data-navigate]");
      if (!navigationTarget || navigationTarget.matches(".brand")) return;
      event.preventDefault();
      navigateTo(navigationTarget.dataset.navigate);
    });

    document.querySelectorAll(".form-card").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
      });
    });
