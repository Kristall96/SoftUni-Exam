let notificationTimeout; // Declare a global variable for the timeout

const showNotification = (message) => {
  const errorBox = document.getElementById("errorBox");
  if (errorBox) {
    const msgSpan = errorBox.querySelector(".msg");
    msgSpan.textContent = message;
    errorBox.style.display = "block";

    if (notificationTimeout) {
      clearTimeout(notificationTimeout); // Clear any existing timeout
    }

    notificationTimeout = setTimeout(() => {
      errorBox.style.display = "none";
    }, 3000);
  }
};
// Function to hide all sections
const hideAllSections = () => {
  const sections = document.querySelectorAll(
    "main > section, .heading, .no-drones"
  );
  for (let i = 0; i < sections.length; i++) {
    sections[i].style.display = "none";
  }
};
document.addEventListener("DOMContentLoaded", () => {
  // **Login Functionality**
  document
    .querySelector(".login-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      // Frontend validation
      if (!email || !password) {
        showNotification("All fields are required.");
        return; // Stop the function if validation fails
      }

      try {
        const response = await fetch("http://localhost:3030/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const responseData = await response.json();
          sessionStorage.setItem("accessToken", responseData.accessToken);
          showNotification("Login successful!");
          window.location.href = "/index.html";
        } else {
          const error = await response.json();
          showNotification(error.message || "Login or password don't match.");
        }
      } catch (err) {
        console.error(err);
        showNotification("Failed to connect to the server.");
      }
    });

  // **Register Functionality**
  const registerForm = document.querySelector(".register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("register-email").value.trim();
      const password = document
        .getElementById("register-password")
        .value.trim();
      const repeatPassword = document
        .getElementById("repeat-password")
        .value.trim();

      if (!email || !password || !repeatPassword)
        return showNotification("All fields are required.");

      if (password !== repeatPassword)
        return showNotification("Passwords don't match.");

      try {
        const response = await fetch("http://localhost:3030/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const result = await response.json();
          sessionStorage.setItem("accessToken", result.accessToken);
          showNotification(
            "Registration successful! Redirecting to Home page..."
          );

          window.location.href = "/index.html";
        } else {
          const error = await response.json();
          showNotification(`${error.message}`);
        }
      } catch (err) {
        console.error(err);
        showNotification("Failed to connect to the server.");
      }
    });
  }

  // **Logout Functionality**
  const logoutButton = document.querySelector(".user a:nth-child(2)");
  if (logoutButton) {
    logoutButton.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        const response = await fetch("http://localhost:3030/users/logout", {
          method: "GET",
          headers: { "X-Authorization": sessionStorage.getItem("accessToken") },
        });

        if (response.ok) {
          sessionStorage.clear();
          showNotification("You have successfully logged out.");

          window.location.href = "/index.html";
        } else {
          showNotification("Logout failed. Please try again.");
        }
      } catch (err) {
        console.error(err);
        showNotification("Failed to connect to the server.");
      }
    });
  }
  /////////////////////////////////////////////////////////////////////
  const drones = []; // Array to store all drones (static and dynamic)

  // **Initialize Static Drones**
  const initializeStaticDrones = () => {
    const staticDrones = document.querySelectorAll("#dashboard .drone");
    staticDrones.forEach((drone, index) => {
      const droneData = {
        id: `${index + 1}`, // Unique ID
        model: drone.querySelector(".model").textContent,
        imageUrl: drone.querySelector("img").src,
        price: drone.querySelector(".price").textContent.split("€")[1],
        condition: drone.querySelector(".condition").textContent.split(": ")[1],
        weight: drone.querySelector(".weight").textContent.split(": ")[1],
        description: `Description for ${
          drone.querySelector(".model").textContent
        }`, // Placeholder
        phone: "123456789", // Placeholder
      };

      drones.push(droneData); // Add to global drone array
      drone.setAttribute("data-id", droneData.id);

      // Attach "Details" button functionality
      const detailsButton = drone.querySelector(".details-btn");
      detailsButton.addEventListener("click", (event) => {
        event.preventDefault();
        displayDroneDetails(droneData.id);
      });
    });
  };

  // **Create Drone Offer Functionality**
  document
    .querySelector(".create-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const token = sessionStorage.getItem("accessToken");
      if (!token)
        return showNotification(
          "You must be logged in to create a drone offer."
        );

      const model = document.getElementById("model").value.trim();
      const imageUrl = document.getElementById("imageUrl").value.trim();
      const price = parseFloat(document.getElementById("price").value.trim());
      const weight = parseFloat(document.getElementById("weight").value.trim());
      const phone = document.getElementById("phone").value.trim();
      const condition = document.getElementById("condition").value.trim();
      const description = document.getElementById("description").value.trim();

      if (
        !model ||
        !imageUrl ||
        isNaN(price) ||
        isNaN(weight) ||
        !phone ||
        !condition ||
        !description
      ) {
        return showNotification("All fields are required.");
      }

      // Create a new drone object
      const newDrone = {
        id: `${drones.length + 1}`, // Unique ID
        model,
        imageUrl,
        price,
        weight,
        phone,
        condition,
        description,
      };

      drones.push(newDrone); // Add new drone to the array
      addDroneToMarketplace(newDrone); // Add to marketplace dynamically
      showNotification("Drone offer successfully created!");

      document.querySelector("nav a:first-child").click(); // Redirect to marketplace
    });

  // **Add Drone to Marketplace**
  const addDroneToMarketplace = (drone) => {
    const dashboardSection = document.getElementById("dashboard");

    const droneDiv = document.createElement("div");
    droneDiv.className = "drone";
    droneDiv.setAttribute("data-id", drone.id);
    droneDiv.innerHTML = `
      <img src="${drone.imageUrl}" alt="${drone.model}" />
      <h3 class="model">${drone.model}</h3>
      <div class="drone-info">
        <p class="price">Price: €${drone.price}</p>
        <p class="condition">Condition: ${drone.condition}</p>
        <p class="weight">Weight: ${drone.weight}g</p>
      </div>
      <a class="details-btn" href="#">Details</a>
    `;

    // Attach "Details" functionality
    const detailsButton = droneDiv.querySelector(".details-btn");
    detailsButton.addEventListener("click", (event) => {
      event.preventDefault();
      displayDroneDetails(drone.id);
    });

    dashboardSection.insertAdjacentElement("afterbegin", droneDiv);
  };

  // **Display Drone Details**
  const displayDroneDetails = (droneId) => {
    hideAllSections();
    const detailsSection = document.getElementById("details");
    detailsSection.style.display = "block";

    const drone = drones.find((d) => d.id === droneId);
    detailsSection.setAttribute("data-drone-id", droneId);
    detailsSection.querySelector("#details-img").src = drone.imageUrl;
    detailsSection.querySelector("#details-model").textContent = drone.model;
    detailsSection.querySelector(
      ".details-price"
    ).textContent = `Price: €${drone.price}`;
    detailsSection.querySelector(
      ".details-condition"
    ).textContent = `Condition: ${drone.condition}`;
    detailsSection.querySelector(
      ".details-weight"
    ).textContent = `Weight: ${drone.weight}g`;
    detailsSection.querySelector(".drone-description").textContent =
      drone.description;
    detailsSection.querySelector(
      ".phone-number"
    ).textContent = `Phone: ${drone.phone}`;

    const actionButtons = detailsSection.querySelector(".buttons");
    const userAuthToken = sessionStorage.getItem("accessToken");
    actionButtons.style.display = userAuthToken ? "flex" : "none";
  };

  // **Sections Management**
  const allSections = document.querySelectorAll(
    "main > section, .heading, .no-drones"
  );

  // **Marketplace Navigation**
  document
    .querySelector("nav a:first-child")
    .addEventListener("click", (event) => {
      event.preventDefault();
      hideAllSections();
      document.querySelector(".heading").style.display = "block";
      document.getElementById("dashboard").style.display = "block";

      const noDronesHeading = document.querySelector(".no-drones");
      const hasDrones =
        document.querySelectorAll("#dashboard .drone").length > 0;
      noDronesHeading.style.display = hasDrones ? "none" : "block";
    });

  // **Sell Navigation**
  document
    .querySelector(".user a:first-child")
    .addEventListener("click", (event) => {
      event.preventDefault();
      hideAllSections();
      document.getElementById("create").style.display = "block";
    });

  // Initialize static drones
  initializeStaticDrones();

  // Delete

  /////////////////////////////////////////////////////
  // **Navigation Buttons**
  const loginNavLink = document.querySelector(".guest a:nth-child(1)");
  const registerNavLink = document.querySelector(".guest a:nth-child(2)");
  const marketplaceNavLink = document.querySelector("nav a:first-child");
  const detailButtons = document.querySelectorAll(".details-btn");
  const detailsSection = document.getElementById("details");

  // Show Login Section
  if (loginNavLink) {
    loginNavLink.addEventListener("click", (event) => {
      event.preventDefault();
      hideAllSections();
      const loginSection = document.getElementById("login");
      if (loginSection) loginSection.style.display = "block";
    });
  }

  // Show Register Section
  if (registerNavLink) {
    registerNavLink.addEventListener("click", (event) => {
      event.preventDefault();
      hideAllSections();
      const registerSection = document.getElementById("register");
      if (registerSection) registerSection.style.display = "block";
    });
  }

  // Show Marketplace Section
  if (marketplaceNavLink) {
    marketplaceNavLink.addEventListener("click", (event) => {
      event.preventDefault();
      hideAllSections();
      const dashboardHeading = document.querySelector(".heading");
      const dashboardSection = document.getElementById("dashboard");
      const noDronesHeading = document.querySelector(".no-drones");

      if (dashboardHeading) dashboardHeading.style.display = "block";
      if (dashboardSection) dashboardSection.style.display = "block";

      const hasDrones = dashboardSection.querySelectorAll(".drone").length > 0;
      if (!hasDrones && noDronesHeading)
        noDronesHeading.style.display = "block";
    });
  }

  // Show Details Section
  if (detailButtons && detailsSection) {
    detailButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        hideAllSections(); // Hide all sections
        detailsSection.style.display = "block"; // Show the details section

        const actionButtons = detailsSection.querySelector(".buttons");
        const userAuthToken = sessionStorage.getItem("accessToken");

        if (actionButtons) {
          // Reset inline styles for Edit and Delete buttons
          const buttons = actionButtons.querySelectorAll("a");
          buttons.forEach((btn) => {
            btn.style.display = ""; // Reset display
            btn.style = ""; // Clear inline styles
          });

          // Show or hide buttons based on login state
          if (userAuthToken) {
            actionButtons.style.display = "flex"; // Show buttons for logged-in users
          } else {
            actionButtons.style.display = "none"; // Hide buttons for guest users
          }
        }
      });
    });
  }

  // Initial State - Show only hero section
  for (let i = 0; i < allSections.length; i++) {
    if (allSections[i].id !== "hero") {
      allSections[i].style.display = "none";
    }
  }

  // Header Navigation Updates
  const loggedInUserNav = document.querySelector(".user");
  const guestUserNav = document.querySelector(".guest");

  const userAuthToken = sessionStorage.getItem("accessToken");

  if (userAuthToken) {
    if (loggedInUserNav) loggedInUserNav.style.display = "flex";
    if (guestUserNav) guestUserNav.style.display = "none";
  } else {
    if (guestUserNav) guestUserNav.style.display = "flex";
    if (loggedInUserNav) loggedInUserNav.style.display = "none";
  }

  // Get the Sell Button
  const sellNavLink = document.querySelector(".user a:first-child"); // Sell link

  // Show Create Product Section
  if (sellNavLink) {
    sellNavLink.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default behavior
      hideAllSections(); // Hide all other sections
      const createSection = document.getElementById("create"); // Target Create Product section
      if (createSection) {
        createSection.style.display = "block"; // Show the Create Product section
      }
    });
  }

  const initializeDeleteFunctionality = () => {
    const deleteButton = document.querySelector("#delete-btn");
    if (deleteButton) {
      deleteButton.addEventListener("click", (event) => {
        event.preventDefault();

        // Get the currently displayed drone's ID
        const detailsSection = document.getElementById("details");
        const droneId = detailsSection.getAttribute("data-drone-id");

        // Find the drone in the array
        const droneIndex = drones.findIndex((drone) => drone.id === droneId);

        if (droneIndex !== -1) {
          const droneToDelete = drones[droneIndex];

          // Prevent deletion of static drones
          if (droneToDelete.isStatic) {
            showNotification("Static drones cannot be deleted.");

            return;
          }

          // Remove the drone from the array
          drones.splice(droneIndex, 1);

          // Remove the drone from the DOM
          const droneCard = document.querySelector(
            `#dashboard .drone[data-id="${droneId}"]`
          );
          if (droneCard) {
            droneCard.remove();
          }

          showNotification("Drone successfully deleted!");

          document.querySelector("nav a:first-child").click(); // Redirect to marketplace
        } else {
          showNotification("Drone not found or already deleted.");
        }
      });
    }
  };

  // Initialize delete functionality
  initializeDeleteFunctionality();

  const initializeEditFunctionality = () => {
    const editButton = document.querySelector("#edit-btn");
    if (editButton) {
      editButton.addEventListener("click", (event) => {
        event.preventDefault();

        // Get the currently displayed drone's ID
        const detailsSection = document.getElementById("details");
        const droneId = detailsSection.getAttribute("data-drone-id");

        // Find the drone in the array
        const droneToEdit = drones.find((drone) => drone.id === droneId);

        if (!droneToEdit) {
          alert("Drone not found.");
          return;
        }

        // Populate the edit form with current details
        document.getElementById("model").value = droneToEdit.model;
        document.getElementById("imageUrl").value = droneToEdit.imageUrl;
        document.getElementById("price").value = droneToEdit.price;
        document.getElementById("weight").value = droneToEdit.weight;
        document.getElementById("phone").value = droneToEdit.phone;
        document.getElementById("condition").value = droneToEdit.condition;
        document.getElementById("description").value = droneToEdit.description;

        // Show the create/edit section
        hideAllSections();
        document.getElementById("create").style.display = "block";

        // Change the submit button to "Save Changes"
        const submitButton = document.querySelector(".create-form button");
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = "Save Changes";

        // Attach a one-time save event listener
        const saveChanges = (event) => {
          event.preventDefault();

          const updatedModel = document.getElementById("model").value.trim();
          const updatedImageUrl = document
            .getElementById("imageUrl")
            .value.trim();
          const updatedPrice = parseFloat(
            document.getElementById("price").value.trim()
          );
          const updatedWeight = parseFloat(
            document.getElementById("weight").value.trim()
          );
          const updatedPhone = document.getElementById("phone").value.trim();
          const updatedCondition = document
            .getElementById("condition")
            .value.trim();
          const updatedDescription = document
            .getElementById("description")
            .value.trim();

          if (
            !updatedModel ||
            !updatedImageUrl ||
            isNaN(updatedPrice) ||
            isNaN(updatedWeight) ||
            !updatedPhone ||
            !updatedCondition ||
            !updatedDescription
          ) {
            showNotification("All fields are required.");

            return;
          }

          // Update the drone in the array
          droneToEdit.model = updatedModel;
          droneToEdit.imageUrl = updatedImageUrl;
          droneToEdit.price = updatedPrice;
          droneToEdit.weight = updatedWeight;
          droneToEdit.phone = updatedPhone;
          droneToEdit.condition = updatedCondition;
          droneToEdit.description = updatedDescription;

          // Update the DOM for the drone card
          const droneCard = document.querySelector(
            `#dashboard .drone[data-id="${droneId}"]`
          );
          if (droneCard) {
            droneCard.querySelector(".model").textContent = updatedModel;
            droneCard.querySelector("img").src = updatedImageUrl;
            droneCard.querySelector(
              ".price"
            ).textContent = `Price: €${updatedPrice}`;
            droneCard.querySelector(
              ".condition"
            ).textContent = `Condition: ${updatedCondition}`;
            droneCard.querySelector(
              ".weight"
            ).textContent = `Weight: ${updatedWeight}g`;
          }

          // Revert the button text and remove the event listener
          submitButton.textContent = originalButtonText;
          submitButton.removeEventListener("click", saveChanges);

          showNotification("Drone successfully updated!");

          document.querySelector("nav a:first-child").click(); // Redirect to marketplace
        };

        submitButton.addEventListener("click", saveChanges);
      });
    }
  };

  // Initialize edit functionality
  initializeEditFunctionality();
});
document
  .querySelector("nav a:first-child")
  .addEventListener("click", (event) => {
    event.preventDefault();
    hideAllSections(); // Hide all other sections
    document.querySelector(".heading").style.display = "block"; // Show header
    const dashboard = document.getElementById("dashboard");
    const noDronesHeading = document.querySelector(".no-drones");
    const hasDrones = document.querySelectorAll("#dashboard .drone").length > 0;

    // Ensure dashboard is displayed
    dashboard.style.display = "block";
    dashboard.style.position = "relative";

    if (!hasDrones) {
      // Display and center the "No Drones Available" message dynamically
      noDronesHeading.style.display = "flex";
      noDronesHeading.style.justifyContent = "center";
      noDronesHeading.style.alignItems = "center";
      noDronesHeading.style.position = "absolute";
      noDronesHeading.style.top = "50%";
      noDronesHeading.style.left = "50%";
      noDronesHeading.style.transform = "translate(-50%, -50%)";
      noDronesHeading.style.width = "100%";
      noDronesHeading.style.fontSize = "42px";
      noDronesHeading.style.backgroundColor = "rgba(5, 5, 5, 0.866)";
      noDronesHeading.style.color = "white";
      noDronesHeading.style.padding = "10px";
      noDronesHeading.style.borderRadius = "20px";

      // Set dashboard height for proper alignment
      dashboard.style.minHeight = "100vh";
    } else {
      // Hide the message if drones exist
      noDronesHeading.style.display = "none";
      dashboard.style.minHeight = ""; // Reset parent height
    }
  });
