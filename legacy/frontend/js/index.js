(function($) {

    // ===== Core Functionality =====
    $('#with-other').click(function() {
        $('#other-chars').parent().slideToggle();
    });
    $("#primary").tinycolorpicker();
    var primaryPicker = $('#primary').data("plugin_tinycolorpicker");
    primaryPicker.setColor("#1ABC9C");

    $("#secondary").tinycolorpicker();
    var secondaryPicker = $('#secondary').data("plugin_tinycolorpicker");
    secondaryPicker.setColor("#ffffff");

    // ===== Theme Management =====
    function initTheme() {
        const savedTheme = localStorage.getItem('pcg-theme') || 'light';
        applyTheme(savedTheme);
        $('#theme-selector').val(savedTheme);
    }

    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('pcg-theme', theme);
    }

    $('#theme-selector').on('change', function() {
        applyTheme($(this).val());
    });

    // ===== Font Selection =====
    function initFont() {
        const savedFont = localStorage.getItem('pcg-font') || 'sans-serif';
        applyFont(savedFont);
        $('#font-selector').val(savedFont);
    }

    function applyFont(font) {
        document.body.setAttribute('data-font', font);
        localStorage.setItem('pcg-font', font);
    }

    $('#font-selector').on('change', function() {
        applyFont($(this).val());
    });

    // ===== Password Pattern Example Generator =====
    function generatePasswordExample() {
        const pattern = getSelectedPattern();
        const length = 12;
        let password = '';
        
        if (pattern.length === 0) {
            $('#password-example').text('Select at least one character type');
            return;
        }
        
        for (let i = 0; i < length; i++) {
            password += pattern[Math.floor(Math.random() * pattern.length)];
        }
        
        $('#password-example').text(password);
    }

    function getSelectedPattern() {
        let pattern = '';
        if ($('#with-numbers').is(':checked')) pattern += '0123456789';
        if ($('#with-lower').is(':checked')) pattern += 'abcdefghijklmnopqrstuvwxyz';
        if ($('#with-upper').is(':checked')) pattern += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if ($('#with-symbols').is(':checked')) pattern += '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
        if ($('#with-space').is(':checked')) pattern += ' ';
        if ($('#with-other').is(':checked')) {
            const otherChars = $('#other-chars').val();
            if (otherChars) pattern += otherChars;
        }
        return pattern;
    }

    // Update example when pattern changes
    $('.button-group input[type="checkbox"]').on('change', generatePasswordExample);
    $('#other-chars').on('input', generatePasswordExample);
    $('#generate-example-btn').on('click', generatePasswordExample);

    // ===== Export/Import Settings =====
    function exportSettings() {
        const settings = {
            withNumbers: $('#with-numbers').is(':checked'),
            withLower: $('#with-lower').is(':checked'),
            withUpper: $('#with-upper').is(':checked'),
            withSymbols: $('#with-symbols').is(':checked'),
            withSpace: $('#with-space').is(':checked'),
            withOther: $('#with-other').is(':checked'),
            otherChars: $('#other-chars').val(),
            keyboardLayout: $('select[name="keyboardlayout"]').val(),
            msg: $('input[name="msg"]').val(),
            watermarkUrl: $('input[name="watermark-url"]').val(),
            primaryColor: $('input[name="primaryColor"]').val(),
            secondaryColor: $('input[name="secondaryColor"]').val(),
            hashAlgorithm: $('#hash-algorithm').val(),
            spaceLength: $('#space-size').val(),
            theme: $('#theme-selector').val(),
            font: $('#font-selector').val(),
            qrCodeEnabled: $('#qr-code-enabled').is(':checked')
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "passwordcard-settings.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function importSettings(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const settings = JSON.parse(e.target.result);
                
                // Apply settings
                $('#with-numbers').prop('checked', settings.withNumbers);
                $('#with-lower').prop('checked', settings.withLower);
                $('#with-upper').prop('checked', settings.withUpper);
                $('#with-symbols').prop('checked', settings.withSymbols);
                $('#with-space').prop('checked', settings.withSpace);
                $('#with-other').prop('checked', settings.withOther);
                $('#other-chars').val(settings.otherChars || '');
                $('select[name="keyboardlayout"]').val(settings.keyboardLayout || 'qwerty');
                $('input[name="msg"]').val(settings.msg || '');
                $('input[name="watermark-url"]').val(settings.watermarkUrl || '');
                $('input[name="primaryColor"]').val(settings.primaryColor || '#1ABC9C');
                $('input[name="secondaryColor"]').val(settings.secondaryColor || '#ffffff');
                $('#hash-algorithm').val(settings.hashAlgorithm || 'sha256');
                $('#space-size').val(settings.spaceLength || '');
                
                if (settings.theme) {
                    $('#theme-selector').val(settings.theme).trigger('change');
                }
                if (settings.font) {
                    $('#font-selector').val(settings.font).trigger('change');
                }
                if (settings.qrCodeEnabled !== undefined) {
                    $('#qr-code-enabled').prop('checked', settings.qrCodeEnabled);
                }
                
                // Update color pickers
                primaryPicker.setColor(settings.primaryColor || '#1ABC9C');
                secondaryPicker.setColor(settings.secondaryColor || '#ffffff');
                
                // Show other chars field if needed
                if (settings.withOther) {
                    $('#other-chars').parent().show();
                }
                
                alert('Settings imported successfully!');
                generatePasswordExample();
            } catch (err) {
                alert('Error importing settings: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    $('#export-settings-btn').on('click', exportSettings);
    
    $('#import-settings-btn').on('click', function() {
        $('#import-settings-file').click();
    });
    
    $('#import-settings-file').on('change', function(e) {
        if (e.target.files.length > 0) {
            importSettings(e.target.files[0]);
        }
    });

    // ===== Clear Local Storage =====
    $('#clear-storage-btn').on('click', function() {
        if (confirm('Are you sure you want to clear all locally stored settings? This action cannot be undone.')) {
            localStorage.clear();
            alert('Local storage cleared successfully!');
            location.reload();
        }
    });

    // ===== Audit Mode Toggle =====
    $('#audit-mode-toggle').on('click', function() {
        $('#audit-panel').slideToggle();
        $(this).text($(this).text().includes('Show') ? 'Hide Audit Panel' : 'Show Audit Panel');
    });

    // ===== About Modal =====
    $('#about-modal-toggle').on('click', function() {
        $('#about-modal').fadeIn();
    });

    $('.modal-close').on('click', function() {
        $('#about-modal').fadeOut();
    });

    $(window).on('click', function(e) {
        if ($(e.target).is('#about-modal')) {
            $('#about-modal').fadeOut();
        }
    });

    // ===== Keyboard Navigation Enhancements =====
    function enhanceAccessibility() {
        // Add keyboard support for custom checkboxes
        $('.button-group label').attr('tabindex', '0').on('keypress', function(e) {
            if (e.which === 13 || e.which === 32) {
                e.preventDefault();
                $(this).prev('input').click();
            }
        });
    }

    // ===== Multi-card Batch Generation =====
    $('#batch-generate-toggle').on('change', function() {
        $('#batch-options').slideToggle();
    });

    $('#add-batch-card').on('click', function() {
        const count = $('#batch-card-list .batch-card-item').length + 1;
        const html = `
            <div class="batch-card-item" data-index="${count}">
                <span>Card ${count}</span>
                <input type="text" class="batch-seed" placeholder="Seed (optional)" style="width: 150px; margin: 0 10px;">
                <input type="text" class="batch-label" placeholder="Label" style="width: 150px; margin: 0 10px;">
                <button type="button" class="remove-batch-card" style="padding: 5px 10px;">Remove</button>
            </div>
        `;
        $('#batch-card-list').append(html);
    });

    $(document).on('click', '.remove-batch-card', function() {
        $(this).closest('.batch-card-item').remove();
    });

    // ===== Initialize =====
    initTheme();
    initFont();
    generatePasswordExample();
    enhanceAccessibility();

})(jQuery);
