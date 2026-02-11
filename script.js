window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Minimum display time for smoothness
        setTimeout(() => {
            preloader.classList.add('fade-out');
            // Remove from DOM after transition to clean up
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500); // Match CSS transition duration
        }, 500); // Show for at least 500ms
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Use safe checking
    const checkInCarousel = document.getElementById('checkInCarousel');
    const checkOutCarousel = document.getElementById('checkOutCarousel');

    // Header Elements
    const monthTriggerIn = document.getElementById('monthTriggerIn');
    const yearTriggerIn = document.getElementById('yearTriggerIn');
    const monthTriggerOut = document.getElementById('monthTriggerOut');
    const yearTriggerOut = document.getElementById('yearTriggerOut');

    // State
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let viewDateIn = new Date(today);
    let viewDateOut = new Date(today);

    let selectedCheckIn = null;
    let selectedCheckOut = null;

    // Constants
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const FULL_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const CURRENT_YEAR = today.getFullYear();
    const YEAR_RANGE = 5;

    // Initialize
    init();

    function init() {
        // Force Text Update immediately to clear "Loading..."
        updateHeaderText();

        // Populate Hidden Dropdowns (if they exist)
        populateDropdowns();

        // Render Dates
        renderMonth(checkInCarousel, viewDateIn, 'checkIn');
        renderMonth(checkOutCarousel, viewDateOut, 'checkOut');

        setupNavListeners();
        setupDropdownListeners(); // Click-to-edit logic
        setupWheelScrolling();

        document.addEventListener('click', closeAllDropdowns);

        // Scroll to Today
        setTimeout(() => {
            scrollToToday(checkInCarousel);
            scrollToToday(checkOutCarousel);
        }, 100);
    }

    function updateHeaderText() {
        if (monthTriggerIn) monthTriggerIn.textContent = FULL_MONTH_NAMES[viewDateIn.getMonth()];
        if (yearTriggerIn) yearTriggerIn.textContent = viewDateIn.getFullYear();

        if (monthTriggerOut) monthTriggerOut.textContent = FULL_MONTH_NAMES[viewDateOut.getMonth()];
        if (yearTriggerOut) yearTriggerOut.textContent = viewDateOut.getFullYear();
    }

    function populateDropdowns() {
        const monthListIn = document.getElementById('monthListIn');
        const monthListOut = document.getElementById('monthListOut');
        const yearListIn = document.getElementById('yearListIn');
        const yearListOut = document.getElementById('yearListOut');

        // Months
        [monthListIn, monthListOut].forEach(list => {
            if (!list) return;
            list.innerHTML = '';
            FULL_MONTH_NAMES.forEach((name, index) => {
                const opt = document.createElement('div');
                opt.className = 'dropdown-option';
                opt.textContent = name;
                opt.dataset.value = index;
                list.appendChild(opt);
            });
        });

        // Years
        [yearListIn, yearListOut].forEach(list => {
            if (!list) return;
            list.innerHTML = '';
            for (let i = 0; i <= YEAR_RANGE; i++) {
                const year = CURRENT_YEAR + i;
                const opt = document.createElement('div');
                opt.className = 'dropdown-option';
                opt.textContent = year;
                opt.dataset.value = year;
                list.appendChild(opt);
            }
        });
    }

    function syncHeaders(type) {
        updateHeaderText(); // Simple wrapper

        // Update selection highlights
        const monthList = type === 'checkIn' ? document.getElementById('monthListIn') : document.getElementById('monthListOut');
        const yearList = type === 'checkIn' ? document.getElementById('yearListIn') : document.getElementById('yearListOut');
        const viewDate = type === 'checkIn' ? viewDateIn : viewDateOut;

        if (monthList) highlightOption(monthList, viewDate.getMonth());
        if (yearList) highlightOption(yearList, viewDate.getFullYear());
    }

    function highlightOption(list, value) {
        if (!list) return;
        const current = list.querySelector('.selected');
        if (current) current.classList.remove('selected');
        const next = list.querySelector(`[data-value="${value}"]`);
        if (next) next.classList.add('selected');
    }

    function setupDropdownListeners() {
        const monthListIn = document.getElementById('monthListIn');
        const yearListIn = document.getElementById('yearListIn');
        const monthListOut = document.getElementById('monthListOut');
        const yearListOut = document.getElementById('yearListOut');

        // Toggle Logic
        if (monthTriggerIn && monthListIn) setupToggle(monthTriggerIn, monthListIn);
        if (yearTriggerIn && yearListIn) setupToggle(yearTriggerIn, yearListIn);
        if (monthTriggerOut && monthListOut) setupToggle(monthTriggerOut, monthListOut);
        if (yearTriggerOut && yearListOut) setupToggle(yearTriggerOut, yearListOut);

        // Selection Logic
        if (monthListIn) setupSelection(monthListIn, 'checkIn', 'month');
        if (yearListIn) setupSelection(yearListIn, 'checkIn', 'year');
        if (monthListOut) setupSelection(monthListOut, 'checkOut', 'month');
        if (yearListOut) setupSelection(yearListOut, 'checkOut', 'year');
    }

    function setupToggle(trigger, list) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasOpen = list.classList.contains('show');
            closeAllDropdowns();

            if (!wasOpen) {
                list.classList.add('show');

                // Hide triggers in this specific wrapper
                const wrapper = trigger.closest('.title-wrapper');
                if (wrapper) {
                    wrapper.querySelectorAll('.header-trigger').forEach(t => t.classList.add('hidden'));
                }

                // Scroll to selected
                const selected = list.querySelector('.selected');
                if (selected) selected.scrollIntoView({ block: 'center' });
            }
        });
    }

    function setupSelection(list, type, field) {
        list.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-option')) {
                const val = parseInt(e.target.dataset.value);
                const targetDate = type === 'checkIn' ? viewDateIn : viewDateOut;

                if (field === 'month') targetDate.setMonth(val);
                if (field === 'year') targetDate.setFullYear(val);

                if (type === 'checkIn') {
                    renderMonth(document.getElementById('checkInCarousel'), viewDateIn, 'checkIn');

                    // Sync Check-out view to match the new Check-in view
                    viewDateOut = new Date(viewDateIn);
                    renderMonth(document.getElementById('checkOutCarousel'), viewDateOut, 'checkOut');
                } else {
                    renderMonth(document.getElementById('checkOutCarousel'), viewDateOut, 'checkOut');
                }

                closeAllDropdowns();
            }
        });
    }

    function closeAllDropdowns() {
        document.querySelectorAll('.header-dropdown').forEach(d => {
            d.classList.remove('show');
        });
        // Show all triggers again
        document.querySelectorAll('.header-trigger').forEach(t => t.classList.remove('hidden'));
    }

    function setupNavListeners() {
        document.getElementById('prevMonthIn')?.addEventListener('click', () => changeMonth('checkIn', -1));
        document.getElementById('nextMonthIn')?.addEventListener('click', () => changeMonth('checkIn', 1));
        document.getElementById('prevMonthOut')?.addEventListener('click', () => changeMonth('checkOut', -1));
        document.getElementById('nextMonthOut')?.addEventListener('click', () => changeMonth('checkOut', 1));
    }

    function setupWheelScrolling() {
        [checkInCarousel, checkOutCarousel].forEach(container => {
            if (!container) return;
            container.addEventListener('wheel', (evt) => {
                evt.preventDefault();
                container.scrollBy({
                    left: evt.deltaY,
                    behavior: 'auto'
                });
            });
        });
    }

    function changeMonth(type, offset) {
        if (type === 'checkIn') {
            viewDateIn.setMonth(viewDateIn.getMonth() + offset);
            renderMonth(checkInCarousel, viewDateIn, 'checkIn');
        } else {
            viewDateOut.setMonth(viewDateOut.getMonth() + offset);
            renderMonth(checkOutCarousel, viewDateOut, 'checkOut');
        }
    }

    // Helper: Format Date as YYYY-MM-DD (Local Time)
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Generate Array of Dates for a specific month
    function generateMonthDates(viewDate) {
        const dates = [];
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            dates.push(date);
        }
        return dates;
    }

    // Render a carousel for a specific month
    function renderMonth(container, viewDate, type) {
        if (!container) return;
        const dates = generateMonthDates(viewDate);
        container.innerHTML = '';

        // Sync Headers
        syncHeaders(type);

        dates.forEach(date => {
            const card = document.createElement('div');
            card.className = 'date-card';

            const dateStr = formatDate(date);
            card.dataset.date = dateStr;
            card.dataset.type = type;

            const dayName = document.createElement('div');
            dayName.className = 'day-name';
            dayName.textContent = DAY_NAMES[date.getDay()];

            const dayNum = document.createElement('div');
            dayNum.className = 'day-number';
            dayNum.textContent = date.getDate();

            card.appendChild(dayName);
            card.appendChild(dayNum);

            // Styling State
            if (date < today) {
                card.classList.add('disabled');
            }

            if (type === 'checkIn' && selectedCheckIn && dateStr === formatDate(selectedCheckIn)) {
                card.classList.add('selected');
            }
            if (type === 'checkOut' && selectedCheckOut && dateStr === formatDate(selectedCheckOut)) {
                card.classList.add('selected');
            }

            if (type === 'checkOut' && selectedCheckIn && date <= selectedCheckIn) {
                card.classList.add('disabled');
            }

            card.addEventListener('click', () => handleDateClick(date, dateStr, type, card));
            container.appendChild(card);
        });
    }

    function handleDateClick(dateObj, dateStr, type, cardElement) {
        if (cardElement.classList.contains('disabled')) return;

        const group = type === 'checkIn' ? checkInCarousel : checkOutCarousel;
        const currentSelected = group.querySelector('.selected');
        if (currentSelected) currentSelected.classList.remove('selected');

        cardElement.classList.add('selected');
        scrollToCenter(cardElement, group);

        // Update Hidden Inputs
        const input = type === 'checkIn' ? document.getElementById('checkInInput') : document.getElementById('checkOutInput');
        if (input) input.value = dateStr;

        if (type === 'checkIn') {
            selectedCheckIn = dateObj;

            // Sync Check-out View
            viewDateOut = new Date(selectedCheckIn);
            viewDateOut.setDate(1);

            renderMonth(checkOutCarousel, viewDateOut, 'checkOut');

            setTimeout(() => {
                const targetCard = checkOutCarousel.querySelector(`[data-date="${dateStr}"]`);
                if (targetCard) {
                    const scrollLeft = targetCard.offsetLeft - 20;
                    checkOutCarousel.scrollTo({
                        left: Math.max(0, scrollLeft),
                        behavior: 'smooth'
                    });
                }
            }, 50);

            if (selectedCheckOut && selectedCheckOut <= selectedCheckIn) {
                selectedCheckOut = null;
                const outInput = document.getElementById('checkOutInput');
                if (outInput) outInput.value = '';
                const currentFn = checkOutCarousel.querySelector('.selected');
                if (currentFn) currentFn.classList.remove('selected');
            }
        } else {
            selectedCheckOut = dateObj;
        }

        const dateError = document.getElementById('dateError');
        const formMessage = document.getElementById('formMessage');
        if (dateError) dateError.textContent = '';
        if (formMessage) formMessage.textContent = '';
    }

    function scrollToCenter(card, container) {
        const scrollLeft = card.offsetLeft - (container.clientWidth / 2) + (card.offsetWidth / 2);
        container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        });
    }

    function scrollToToday(container) {
        if (!container) return;
        const todayStr = formatDate(new Date());
        const todayCard = container.querySelector(`[data-date="${todayStr}"]`);
        if (todayCard) {
            scrollToCenter(todayCard, container);
        }
    }

    // Form Submission
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Clear previous errors
            const dateError = document.getElementById('dateError');
            const roomTypeError = document.getElementById('roomTypeError');
            const guestError = document.getElementById('guestError');
            if (dateError) dateError.textContent = '';
            if (roomTypeError) roomTypeError.textContent = '';
            if (guestError) guestError.textContent = '';

            let isValid = true;

            // Validate Dates
            if (!selectedCheckIn || !selectedCheckOut) {
                if (dateError) dateError.textContent = "Please select both Check-in and Check-out dates.";
                isValid = false;
            } else if (selectedCheckOut <= selectedCheckIn) {
                if (dateError) dateError.textContent = "Check-out must be after Check-in.";
                isValid = false;
            }

            // Validate Room Type
            const roomType = document.getElementById('roomType').value;
            if (!roomType) {
                if (roomTypeError) roomTypeError.textContent = "Please select a room type.";
                isValid = false;
            }

            // Validate Guests
            const guestCount = document.getElementById('guestCount');
            if (!guestCount.value || guestCount.value < 1 || guestCount.value > 10) {
                if (guestError) guestError.textContent = "Please enter a valid number of guests (1-10).";
                isValid = false;
            }

            if (!isValid) return;

            // Success Logic...
            const btn = document.getElementById('submitBtn');
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Booked!';
            btn.style.backgroundColor = '#27ae60';

            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.style.backgroundColor = '';
            }, 3000);
        });
    }
    // Custom Select Logic
    setupCustomSelect();

    function setupCustomSelect() {
        const customSelect = document.getElementById('roomTypeSelect');
        const input = document.getElementById('roomType');

        if (!customSelect || !input) return;

        const trigger = customSelect.querySelector('.custom-select-trigger');
        const options = customSelect.querySelectorAll('.custom-option');
        const span = trigger.querySelector('span');

        // Toggle Open/Close
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            customSelect.classList.toggle('open');
            closeAllDropdowns(customSelect); // Close other dropdowns
        });

        // Handle Option Click
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                // Update text and class
                span.textContent = option.textContent;
                trigger.classList.add('has-value');

                // Update Input Value
                const val = option.dataset.value;
                input.value = val;

                // Clear Error
                const roomTypeError = document.getElementById('roomTypeError');
                if (roomTypeError) roomTypeError.textContent = "";

                // Visual Selection
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                // Close
                customSelect.classList.remove('open');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove('open');
            }
        });
    }

    // Helper to close date dropdowns when opening room select
    // We modify existing closeAllDropdowns to accept an exception or handle it here
    // But since closeAllDropdowns is already closing header-dropdowns, we can just let it be.
    // However, if we want strict mutual exclusivity:
    const originalCloseAll = closeAllDropdowns;
    /* Redefining strict behavior if needed, but for now standard click listener does it */
});
