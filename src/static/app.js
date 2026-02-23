document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

            // Create participants list HTML
            let participantsHTML = "";
            if (details.participants.length > 0) {
              participantsHTML = `
                <div class="participants-section">
                  <strong>Participants:</strong>
                  <div class="participants-list">
                    ${details.participants
                      .map(
                        (email) => `
                          <span class="participant-item">
                            <span class="participant-email">${email}</span>
                            <button class="delete-participant" title="Remove participant" data-activity="${name}" data-email="${email}">
                              <svg class="delete-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c62828" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </span>
                        `
                      )
                      .join("")}
                  </div>
                </div>
              `;
            } else {
              participantsHTML = `
                <div class="participants-section">
                  <strong>Participants:</strong>
                  <p class="participants-none">No participants yet.</p>
                </div>
              `;
            }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }
        activitiesList.appendChild(activityCard);

        // Add delete functionality for participants
        activityCard.querySelectorAll(".delete-participant").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            e.preventDefault();
            const activityName = btn.getAttribute("data-activity");
            const email = btn.getAttribute("data-email");
            try {
              const response = await fetch(
                `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`,
                {
                  method: "POST",
                }
              );
              const result = await response.json();
              if (response.ok) {
                // Refresh activities list
                fetchActivities();
                messageDiv.textContent = result.message || "Participant removed.";
                messageDiv.className = "success";
              } else {
                messageDiv.textContent = result.detail || "Failed to remove participant.";
                messageDiv.className = "error";
              }
              messageDiv.classList.remove("hidden");
              setTimeout(() => {
                messageDiv.classList.add("hidden");
              }, 5000);
            } catch (error) {
              messageDiv.textContent = "Failed to remove participant. Please try again.";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
              setTimeout(() => {
                messageDiv.classList.add("hidden");
              }, 5000);
            }
          });
        });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
