const habitForm = document.getElementById('habit-form');
const habitNameInput = document.getElementById('habit-name');
const habitList = document.getElementById('habit-list');
const template = document.getElementById('habit-template');

async function getHabits() {
  const response = await fetch('/api/habits');
  if (!response.ok) throw new Error('Failed to load habits');
  return response.json();
}

async function createHabit(name) {
  const response = await fetch('/api/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error || 'Failed to create habit');
  }
}

async function toggleHabit(id) {
  const response = await fetch(`/api/habits/${id}/toggle`, { method: 'PATCH' });
  if (!response.ok) throw new Error('Failed to toggle habit');
}

async function deleteHabit(id) {
  const response = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete habit');
}

function renderHabits(habits) {
  habitList.innerHTML = '';

  if (habits.length === 0) {
    habitList.innerHTML = '<li class="habit-meta">No habits yet. Add your first one.</li>';
    return;
  }

  habits.forEach((habit) => {
    const node = template.content.cloneNode(true);
    node.querySelector('.habit-name').textContent = habit.name;
    node.querySelector('.habit-meta').textContent = `Streak: ${habit.streak} day${habit.streak === 1 ? '' : 's'}`;

    const toggleButton = node.querySelector('.toggle-btn');
    toggleButton.textContent = habit.completedToday ? 'Undo Today' : 'Done Today';
    toggleButton.classList.toggle('done', habit.completedToday);
    toggleButton.addEventListener('click', async () => {
      await toggleHabit(habit.id);
      await refresh();
    });

    node.querySelector('.delete-btn').addEventListener('click', async () => {
      await deleteHabit(habit.id);
      await refresh();
    });

    habitList.appendChild(node);
  });
}

async function refresh() {
  try {
    const { habits } = await getHabits();
    renderHabits(habits);
  } catch (error) {
    habitList.innerHTML = `<li class="habit-meta">${error.message}</li>`;
  }
}

habitForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = habitNameInput.value.trim();
  if (!name) return;

  try {
    await createHabit(name);
    habitNameInput.value = '';
    await refresh();
  } catch (error) {
    alert(error.message);
  }
});

refresh();
