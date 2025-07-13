$(document).ready(function () {
    let selectedSymptoms = [];
    const maxSymptoms = 376;

    function openSymptomList() {
        $('.container').show();
        $('.addSymptomsButton').hide();
    }

    function toggleAddMoreButton() {
        const buttonText = selectedSymptoms.length > 0 ? "Add More Symptoms" : "Add Symptoms";
        $('.addSymptomsButton span').text(buttonText);
        $('.addSymptomsButton').show();
    }

    function updateSelectedSymptomsList() {
        $('#selectedSymptomsList').empty();
        $('.sidebar').toggleClass('show', selectedSymptoms.length > 0);

        selectedSymptoms.forEach(function (symptom) {
            $('#selectedSymptomsList').append(
                `<li>
                    <span>${symptom}</span>
                    <span class="remove-symptom" data-symptom="${symptom}">➖</span>
                </li>`
            );
        });
    }

    document.getElementById('clearAllSymptoms').addEventListener('click', function () {
        selectedSymptoms = [];
        $('.addSymptomsButton').show();
        updateSelectedSymptomsList();
        updateSymptomDropdown();
        $('.result-container').removeClass('show');
        $('.disease-result').html('<p>No symptoms analyzed yet</p>');
    });

    function updateSymptomDropdown() {
        $('#symptomDropdown option').each(function () {
            $(this).toggle(!selectedSymptoms.includes($(this).val()));
        });
    }

    $('#selectButton').on('click', function () {
        if (selectedSymptoms.length > maxSymptoms) {
            alert('You can select a maximum of 376 symptoms.');
            return;
        }
        $('.container').hide();
        toggleAddMoreButton();
    });

    // Update only this part in your existing scripts.js
$('#searchButton').on('click', function () {
    if (selectedSymptoms.length === 0) {
        alert('Please select at least one symptom');
        return;
    }

    // Hide sidebar and add symptoms button on mobile
    if (window.innerWidth <= 768) {
        $('.sidebar').hide();  // Hide the selected symptoms list
        $('.addSymptomsButton').hide();
        $('.container').removeClass('mobile-active');  // Hide the symptom selection container
        $('.mobile-overlay').removeClass('active');    // Hide the overlay
    }

    $.ajax({
        type: 'POST',
        url: '/submit_symptoms',
        contentType: 'application/json',
        data: JSON.stringify({ symptoms: selectedSymptoms }),
        success: function (response) {
            if (response.error) {
                $('.disease-result').html(`<p>Error: ${response.error}</p>`);
                $('.learn-more-btn, .rediagnose-btn').hide();
            } else {
                $('.disease-result').html(`<p>You might be suffering from <strong>${response.disease}</strong></p>`);
                
                // Show result container with mobile-specific class
                if (window.innerWidth <= 768) {
                    $('.result-container').addClass('mobile-active');
                    $('.mobile-overlay').addClass('active');
                } else {
                    $('.result-container').addClass('show');
                }

                // Hide the Add Symptoms button
                $('.addSymptomsButton').hide();
                
                // Show and update Learn More button
                $('.learn-more-btn')
                    .show()
                    .off('click')
                    .on('click', function() {
                        const searchQuery = encodeURIComponent(`${response.disease} disease symptoms treatment`);
                        window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
                    });
                
                // Show and update Diagnose Again button
                $('.rediagnose-btn')
                    .show()
                    .off('click')
                    .on('click', function() {
                        if (window.innerWidth <= 768) {
                            $('.sidebar').show();  // Show the selected symptoms list again
                            $('.addSymptomsButton').show();
                            $('.result-container').removeClass('mobile-active');
                            $('.mobile-overlay').removeClass('active');
                        }
                        location.reload();
                    });
            }
        },
        error: function (error) {
            console.error('Error:', error);
            $('.disease-result').html('<p>An error occurred while analyzing symptoms</p>');
            $('.learn-more-btn, .rediagnose-btn').hide();
            $('.result-container').addClass('show');
        }
    });
});

    $('#symptomDropdown').on('change', function () {
        const selectedOption = $(this).val();
        selectedOption.forEach(function (symptom) {
            if (!selectedSymptoms.includes(symptom) && selectedSymptoms.length < maxSymptoms) {
                selectedSymptoms.push(symptom);
            }
        });
        updateSelectedSymptomsList();
        updateSymptomDropdown();
    });

    function filterSymptoms() {
        const searchText = $('#searchBox').val().toLowerCase();
        $('#symptomDropdown option').each(function () {
            const symptom = $(this).text().toLowerCase();
            $(this).toggle(symptom.includes(searchText) && !selectedSymptoms.includes($(this).val()));
        });
    }

    $('#searchBox').on('input', filterSymptoms);

    $('#selectedSymptomsList').on('click', '.remove-symptom', function () {
        const symptom = $(this).data('symptom');
        selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
        updateSelectedSymptomsList();
        updateSymptomDropdown();
    });

    $('.addSymptomsButton').on('click', openSymptomList);
    toggleAddMoreButton();

    // FAQ button toggle
    document.querySelector('.faq-button').addEventListener('click', function () {
        document.querySelector('.help-sidebar').classList.toggle('show');
    });

    function showAnswer(answerId) {
        // Get the clicked answer element
        const answer = $(`#${answerId}`);
        
        // Toggle the clicked answer with animation
        answer.slideToggle(300);
        
        // Get the arrow icon for the clicked item
        const arrowIcon = answer.prev('.help-sidebar-item').find('.arrow-icon');
        
        // Toggle arrow direction
        if (answer.is(':visible')) {
            arrowIcon.html('&#x25BC;');
        } else {
            arrowIcon.html('&#x25B6;');
        }
        
        // Hide other answers
        $('.help-sidebar-answer-popup').not(answer).slideUp(300);
        $('.help-sidebar-item').not(answer.prev()).find('.arrow-icon').html('&#x25B6;');
    }

    // Initialize FAQ functionality when document is ready
    $(document).ready(function() {
        // Add click handlers to FAQ items
        $('.help-sidebar-item').click(function() {
            const answerId = $(this).next('.help-sidebar-answer-popup').attr('id');
            showAnswer(answerId);
        });
        
        // Close FAQs when clicking outside
        $(document).click(function(event) {
            if (!$(event.target).closest('.help-sidebar').length) {
                $('.help-sidebar-answer-popup').slideUp(300);
                $('.arrow-icon').html('&#x25B6;');
            }
        });
    });

    document.querySelector('.about-section').addEventListener('click', function () {
        document.querySelector('.card').classList.toggle('show');
    });

    document.querySelector('.about-close').addEventListener('click', function () {
        document.querySelector('.card').classList.toggle('show');
    });

    document.querySelector('.contact-section').addEventListener('click', function () {
        document.querySelector('.form').classList.toggle('show');
    });

    document.querySelector('.contact-submit').addEventListener('click', function () {
        const name = document.querySelector('#contact-name').value;
        const email = document.querySelector('#contact-email').value;
        const message = document.querySelector('#contact-message').value;

        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }

        // Send data to server
        fetch('/submit-feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Clear form and show thank you message
                const form = document.querySelector('.form');
                form.innerHTML = `
                    <div class="title">Thank You!</div>
                    <p style="color: white; margin: 20px 0;">Your message has been received. We'll get back to you soon.</p>
                    <button type="button" class="contact-close">Close</button>
                `;

                // Add event listener to new close button
                document.querySelector('.contact-close').addEventListener('click', function() {
                    form.classList.remove('show');
                    // Reset form after it's hidden
                    setTimeout(() => {
                        form.innerHTML = `
                            <div class="title">Contact us</div>
                            <input type="text" placeholder="Your name" class="input" id="contact-name" required>
                            <input type="email" placeholder="Your email" class="input" id="contact-email" required>
                            <textarea placeholder="Your message" id="contact-message" required></textarea>
                            <button type="button" class="contact-submit">Submit</button>
                        `;
                    }, 500); // Wait for hide animation to complete
                });
            } else {
                alert('Error submitting feedback. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error submitting feedback. Please try again.');
        });
    });

    document.querySelector('.help-section').addEventListener('click', function () {
        document.querySelector('.help-sidebar').classList.toggle('show');
    });

    // News and Slider Functions
    function fetchAndDisplayNews() {
        $.ajax({
            url: '/get-news',
            method: 'GET',
            success: function(response) {
                const articles = response.articles || [];
                if (articles.length > 0) {
                    updateSlider(articles);
                } else {
                    console.log('No news articles available');
                }
            },
            error: function(error) {
                console.error('Error fetching news:', error);
                // Show default slides if news fetch fails
                showDefaultSlides();
            }
        });
    }

    function updateSlider(articles) {
        const sliderContainer = $('#sliderContainer');
        sliderContainer.empty();
        
        articles.forEach((article, index) => {
            const slide = $(`
                <div class="slide ${index === 0 ? 'active' : ''}">
                    <img src="${article.urlToImage}" 
                         alt="${article.title}">
                    <div class="slide-content">
                        <div class="slide-title">${article.title}</div>
                        <div class="slide-description">${article.description || ''}</div>
                    </div>
                </div>
            `);
            sliderContainer.append(slide);
        });

        // Update pagination
        const pagination = $('#pagination');
        pagination.empty();
        articles.forEach((_, index) => {
            pagination.append(`<span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`);
        });

        // Initialize slider functionality
        initializeSlider();
    }

    function showDefaultSlides() {
        const defaultSlides = [
            {
                title: 'Welcome to Health Check',
                description: 'Your personal health assistant for preliminary disease identification.',
                image: 'static/images/slide1.jpg'
            },
            {
                title: 'How It Works',
                description: 'Select your symptoms and let our AI analyze potential conditions.',
                image: 'static/images/slide2.jpg'
            },
            {
                title: 'Important Note',
                description: 'This tool is for informational purposes only. Always consult a healthcare professional.',
                image: 'static/images/slide3.jpg'
            }
        ];

        updateSlider(defaultSlides.map(slide => ({
            title: slide.title,
            description: slide.description,
            urlToImage: slide.image
        })));
    }

    function initializeSlider() {
        let currentSlide = 0;
        const slides = $('.slide');
        const dots = $('.dot');
        const totalSlides = slides.length;

        function showSlide(index) {
            slides.removeClass('active');
            dots.removeClass('active');
            $(slides[index]).addClass('active');
            $(dots[index]).addClass('active');
        }

        // Auto advance slides
        setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }, 5000);

        // Click handlers for pagination dots
        dots.click(function() {
            currentSlide = $(this).data('index');
            showSlide(currentSlide);
        });
    }

    // Initialize news slider
    fetchAndDisplayNews();

    // Add this for FAQ functionality
    $(document).ready(function() {
        $('.faq-question').click(function() {
            // Close all other answers
            $('.faq-answer').not($(this).next()).slideUp();
            $('.faq-question').not($(this)).removeClass('active');
            
            // Toggle current answer
            $(this).next().slideToggle();
            $(this).toggleClass('active');
        });
    });

    // Add this to your existing JavaScript
    if (window.innerWidth <= 768) {
        // Mobile navigation handlers
        document.querySelectorAll('.nav-links button').forEach(button => {
            button.addEventListener('click', function() {
                // Hide all active containers
                document.querySelectorAll('.container, .result-container, .help-sidebar, .card, .form')
                    .forEach(el => el.classList.remove('mobile-active'));
                
                // Show overlay
                document.querySelector('.mobile-overlay').classList.add('active');
                
                // Show appropriate container
                if (this.classList.contains('about-section')) {
                    document.querySelector('.card').classList.add('mobile-active');
                } else if (this.classList.contains('help-section')) {
                    document.querySelector('.help-sidebar').classList.add('mobile-active');
                } else if (this.classList.contains('contact-section')) {
                    document.querySelector('.form').classList.add('mobile-active');
                }
            });
        });

        // Add symptom button handler
        document.querySelector('.addSymptomsButton').addEventListener('click', function() {
            document.querySelector('.container').classList.add('mobile-active');
            document.querySelector('.mobile-overlay').classList.add('active');
            document.querySelector('.addSymptomsButton').classList.add('move');
        });

        // Close button handler
        document.querySelectorAll('.mobile-close').forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.mobile-active').classList.remove('mobile-active');
                document.querySelector('.mobile-overlay').classList.remove('active');
            });
        });

        // Overlay click handler
        document.querySelector('.mobile-overlay').addEventListener('click', function() {
            document.querySelectorAll('.mobile-active').forEach(el => {
                el.classList.remove('mobile-active');
            });
            this.classList.remove('active');
        });

        // Show FAQ button on mobile
        document.querySelector('.faq-button').style.display = 'block';
        
        // FAQ button handler for mobile
        document.querySelector('.faq-button').addEventListener('click', function() {
            document.querySelector('.help-sidebar').classList.add('mobile-active');
            document.querySelector('.mobile-overlay').classList.add('active');
        });

        const navLinks = document.querySelector('.nav-links');
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        // Add menu to page
        document.body.appendChild(mobileMenu);

        // Toggle menu on hamburger click
        navLinks.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('show');
        });

        // Handle menu item clicks
        mobileMenu.addEventListener('click', function(e) {
            if (e.target.classList.contains('about-section')) {
                document.querySelector('.card').classList.add('mobile-active');
                document.querySelector('.mobile-overlay').classList.add('active');
            } else if (e.target.classList.contains('contact-section')) {
                document.querySelector('.form').classList.add('mobile-active');
                document.querySelector('.mobile-overlay').classList.add('active');
            }
            mobileMenu.classList.remove('show');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('show');
            }
        });

        const closeButtons = document.querySelectorAll('.card button');
        closeButtons.forEach(button => {
            button.style.display = 'none';
        });
    }
});
