const API_URL = "https://backend-eueq.onrender.com";
window.API_URL = API_URL;

(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();


    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar — always red, always visible
    $('.sticky-top').css('top', '0px');
    $(window).scroll(function () {
        if ($(this).scrollTop() > 10) {
            $('.sticky-top').css({ 'top': '0px', 'box-shadow': '0 4px 20px rgba(0,0,0,0.25)' });
        } else {
            $('.sticky-top').css({ 'top': '0px', 'box-shadow': 'none' });
        }
    });

    // Redirection immédiate vers les services depuis le bouton d'accueil.
    $(document).on('click', '#heroServiceBtn, .hero-service-btn', function (e) {
        e.preventDefault();
        window.location.href = 'services.html';
    });


    // Auto-scroll to bottom of chatbot messages when modal opens
    $('#chatbotModal').on('shown.bs.modal', function () {
        $('#chatbotMessages').scrollTop($('#chatbotMessages')[0].scrollHeight);
    });

    // Chatbot functionality
    var appendChatMessage = function (sender, text) {
        var isUser = (sender === 'user');
        var alignClass = isUser ? 'align-items-end' : 'align-items-start';
        var bgClass = isUser ? 'bg-danger text-white' : 'bg-white text-dark';
        var radiusClass = isUser ? 'border-radius: 18px 18px 4px 18px;' : 'border-radius: 18px 18px 18px 4px;';
        var maxW = isUser ? 'max-width: 80%;' : 'max-width: 85%;';

        var msgHtml = '<div class="d-flex flex-column ' + alignClass + ' chat-msg-anim">' +
            '<div class="p-3 shadow-sm ' + bgClass + '" style="' + radiusClass + ' font-size: 0.85rem; ' + maxW + '">' +
            text.replace(/\n/g, '<br>') +
            '</div>' +
            '</div>';

        $('#chatbotMessages').append(msgHtml);
        $('#chatbotMessages').scrollTop($('#chatbotMessages')[0].scrollHeight);
    };

    var appendAudioMessage = function (sender, audioUrl) {
        var isUser = (sender === 'user');
        var alignClass = isUser ? 'align-items-end' : 'align-items-start';
        var bgClass = isUser ? 'bg-danger text-white' : 'bg-white text-dark';
        var radiusClass = isUser ? 'border-radius: 18px 18px 4px 18px;' : 'border-radius: 18px 18px 18px 4px;';

        var audioHtml = '<div class="d-flex flex-column ' + alignClass + ' chat-msg-anim">' +
            '<div class="p-2 shadow-sm ' + bgClass + '" style="' + radiusClass + ' font-size: 0.85rem; max-width: 85%;">' +
            '<audio controls src="' + audioUrl + '" style="max-width: 240px; height: 40px; outline: none; display: block;"></audio>' +
            '</div>' +
            '</div>';

        $('#chatbotMessages').append(audioHtml);
        $('#chatbotMessages').scrollTop($('#chatbotMessages')[0].scrollHeight);
    };

    var handleChatbotResponse = function (query) {
        var q = query.toLowerCase();
        var reply = "";

        if (q.includes("formation") || q.includes("cours") || q.includes("module") || q.includes("apprendre") || q.includes("bases")) {
            reply = "<i class='fa fa-graduation-cap text-danger me-2'></i>**Nos formations principales :**\n" +
                "• **Les Bases de Windows**\n" +
                "• **Bureautique (Microsoft 365)**\n" +
                "• **Initiation aux outils d'IA** (ChatGPT, Gemini, etc.)\n" +
                "• **Les Bases du Design**\n\n" +
                "Modules spécifiques : *Word, Excel, Access, PowerPoint, Publisher, SharePoint.*\n\n" +
                "<i class='fa fa-arrow-right text-danger me-1'></i> Pour réserver votre place, cliquez sur le bouton rouge **'S'inscrire'** sur la page !";
        } else if (q.includes("adresse") || q.includes("lieu") || q.includes("ou") || q.includes("trouver") || q.includes("unilu") || q.includes("salle") || q.includes("sociales") || q.includes("wazia") || q.includes("kazadi")) {
            reply = "<i class='fa fa-map-marker-alt text-danger me-2'></i>**Notre Adresse officielle :**\n" +
                "Université de Lubumbashi (UNILU), Faculté des Sciences Sociales.\n\n" +
                "**Réf :** Auditoire WAZIA, juste à côté de la chaire de Sociologie du Prof KAZADI KINDU.\n\n" +
                "<i class='fa fa-map text-primary me-1'></i> **Google Maps :** <a href='https://maps.app.goo.gl/9PGNyMNYEFEz272T8' target='_blank' class='text-danger fw-bold'>Cliquez ici pour l'itinéraire</a>";
        } else if (q.includes("inscrire") || q.includes("inscription") || q.includes("formulaire") || q.includes("fiche") || q.includes("participer")) {
            reply = "<i class='fa fa-edit text-danger me-2'></i>**Comment s'inscrire :**\n" +
                "C'est très rapide ! Fermez cette fenêtre de chat et cliquez sur n'importe quel bouton rouge **'S'inscrire'** ou **'S'inscrire maintenant'** sur notre site pour remplir le formulaire officiel.";
        } else {
            reply = "<i class='fa fa-robot text-danger me-2'></i>Je suis **Claudia**, votre assistante virtuelle.\n\n" +
                "Pour toute autre question ou pour parler à un conseiller de la Salle du Numérique :\n" +
                "<i class='fab fa-whatsapp text-success me-1'></i> **WhatsApp :** <a href='https://wa.me/243972147721' target='_blank' class='text-danger fw-bold'>+243 972 147 721</a>\n" +
                "<i class='fa fa-envelope text-primary me-1'></i> **E-mail :** snunilu@unilu.ac.cd\n" +
                "<i class='fa fa-map-pin text-danger me-1'></i> Ou venez nous voir à la Faculté des Sciences Sociales !";
        }

        // Simuler un léger temps de réponse pour plus de réalisme
        setTimeout(function () {
            appendChatMessage('Claudia', reply);
        }, 600);
    };

    var triggerUserMsg = function (text) {
        if (!text.trim()) return;
        appendChatMessage('user', text);
        handleChatbotResponse(text);
    };

    $('#sendChatbotMsg').click(function () {
        var txt = $('#chatbotInput').val();
        if (txt.trim()) {
            triggerUserMsg(txt);
            $('#chatbotInput').val('');
        }
    });

    $('#chatbotInput').keypress(function (e) {
        if (e.which === 13) { // Touche Entrée 
            var txt = $('#chatbotInput').val();
            if (txt.trim()) {
                triggerUserMsg(txt);
                $('#chatbotInput').val('');
            }
        }
    });

    $('.chat-suggest-btn').click(function () {
        var query = $(this).attr('data-query');
        var text = $(this).text();
        triggerUserMsg(text);
    });

    // Voice Note Recording Logic
    var mediaRecorder = null;
    var audioChunks = [];
    var recInterval = null;
    var recSeconds = 0;

    $('#chatbotMicBtn').click(function () {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("L'enregistrement audio n'est pas pris en charge par votre navigateur ou votre connexion sécurisée (HTTPS requis).");
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                audioChunks = [];
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = function (e) {
                    audioChunks.push(e.data);
                };

                mediaRecorder.onstop = function () {
                    // Arrêter la capture du micro
                    stream.getTracks().forEach(function (track) { track.stop(); });

                    // Créer le fichier audio local
                    var audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    var audioUrl = URL.createObjectURL(audioBlob);

                    // Ajouter le lecteur audio dans le chat
                    appendAudioMessage('user', audioUrl);

                    // Réponse automatique de Claudia
                    setTimeout(function () {
                        appendChatMessage('Claudia', "J'ai bien reçu votre note vocale ! Je l'écouterai attentivement et un conseiller vous recontactera.");
                    }, 800);
                };

                // Démarrer l'enregistrement
                mediaRecorder.start();

                // Activer l'affichage d'enregistrement
                recSeconds = 0;
                $('#chatbotRecTimer').text("Enregistrement... 00:00");
                $('#chatbotRecBar').removeClass('d-none');

                // Lancer le compteur de secondes
                recInterval = setInterval(function () {
                    recSeconds++;
                    var mins = Math.floor(recSeconds / 60);
                    var secs = recSeconds % 60;
                    var timeStr = (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
                    $('#chatbotRecTimer').text("Enregistrement... " + timeStr);
                }, 1000);
            })
            .catch(function (err) {
                console.error("Accès microphone refusé :", err);
                alert("Impossible d'accéder au microphone. Veuillez autoriser l'accès pour enregistrer une note vocale.");
            });
    });

    $('#stopChatbotRec').click(function () {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        clearInterval(recInterval);
        $('#chatbotRecBar').addClass('d-none');
    });

    $('#cancelChatbotRec').click(function () {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            // Surcharger onstop pour annuler le message
            mediaRecorder.onstop = function () {
                mediaRecorder.stream.getTracks().forEach(function (track) { track.stop(); });
            };
            mediaRecorder.stop();
        }
        clearInterval(recInterval);
        $('#chatbotRecBar').addClass('d-none');
        audioChunks = [];
    });


    // Header carousel
    $(".header-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        loop: true,
        dots: true,
        items: 1
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        items: 1,
        autoplay: true,
        smartSpeed: 1000,
        animateIn: 'fadeIn',
        animateOut: 'fadeOut',
        dots: true,
        loop: true,
        nav: false
    });

    // Gestion de l'Inscription, de la Fiche et des Partages
    $('.btn-inscrire').click(function () {
        var formation = $(this).attr('data-formation');
        if (formation) {
            $('#regFormation').val(formation);
        }
    });

    $('#enrollmentForm').submit(function (e) {
        e.preventDefault();

        var form = this;
        if (!form.checkValidity()) {
            e.stopPropagation();
            $(form).addClass('was-validated');
            return;
        }

        // Récupérer les valeurs du formulaire
        var fullName = $('#regFullName').val() || "";
        var gender = $('#regGender').val() || "";
        var age = $('#regAge').val() || "";
        var phone = $('#regPhone').val() || "";
        var email = $('#regEmail').val() || "";
        var address = $('#regAddress').val() || "";
        var profession = $('#regProfession').val() || "";
        var education = $('#regEducation').val() || "";
        var formation = $('#regFormation').val() || "";
        var date = $('#regDate').val() || "";
        var comment = $('#regComment').val() || "Aucun commentaire.";

        // Générer le code d'inscription et les dates
        var randomCode = 'SNU-2026-' + Math.floor(1000 + Math.random() * 9000);
        var genDateString = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

        // Remplir les champs de la fiche d'inscription HTML
        $('#ficheCode').text(randomCode);
        $('#ficheFullName').text(fullName);
        $('#ficheGender').text(gender);
        $('#ficheAge').text(age + ' ans');
        $('#fichePhone').text(phone);
        $('#ficheEmail').text(email);
        $('#ficheAddress').text(address);
        $('#ficheProfession').text(profession);
        $('#ficheEducation').text(education);
        $('#ficheFormation').text(formation);
        $('#ficheDate').text(date);
        $('#ficheComment').text(comment);
        $('#ficheGenDate').text(genDateString);

        // Extraire le logo de la modal pour l'intégrer au PDF
        var logoImg = $('#registrationModal img')[0];
        var logoBase64 = "";
        if (logoImg) {
            try {
                var canvas = document.createElement("canvas");
                var w = logoImg.naturalWidth || logoImg.width || 40;
                var h = logoImg.naturalHeight || logoImg.height || 40;
                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(logoImg, 0, 0);
                logoBase64 = canvas.toDataURL("image/jpeg");
            } catch (err) {
                console.warn("Impossible de convertir le logo :", err);
            }
        }

        // Fonction pour configurer et générer le document jsPDF
        var generatePDFDoc = function () {
            if (typeof window.jspdf === 'undefined') {
                console.warn("jsPDF n'est pas disponible (CDN non chargé ou bloqué).");
                return null;
            }
            var { jsPDF } = window.jspdf;
            var doc = new jsPDF();

            // 1. Ajouter le Filigrane (Watermark) en diagonale au milieu
            doc.setFont("helvetica", "bold");
            doc.setFontSize(38);
            doc.setTextColor(245, 235, 235); // Rouge très clair/rose discret
            doc.text("SALLE DU NUMERIQUE", 105, 140, { align: "center", angle: 330 });

            // 2. En-tête de la fiche
            if (logoBase64) {
                // Logo à gauche
                doc.addImage(logoBase64, 'JPEG', 15, 15, 15, 15);
            }

            // Titre de l'institution
            doc.setTextColor(209, 0, 0); // Rouge SNU
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text("Salle du Numérique", 34, 21);

            doc.setTextColor(110, 110, 110);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text("Université de Lubumbashi - UNILU", 34, 26);

            // Code d'inscription (Badge à droite)
            doc.setFillColor(254, 242, 242);
            doc.setDrawColor(209, 0, 0);
            doc.rect(142, 16, 53, 11, 'FD');

            doc.setTextColor(209, 0, 0);
            doc.setFont("courier", "bold");
            doc.setFontSize(10);
            doc.text(randomCode, 168, 23, { align: "center" });

            // Ligne horizontale sous en-tête
            doc.setDrawColor(220, 220, 220);
            doc.line(15, 36, 195, 36);

            // 3. Titre Principal de la Fiche
            doc.setTextColor(33, 37, 41);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.text("FICHE D'INSCRIPTION OFFICIELLE", 105, 46, { align: "center" });

            // 4. Grille des Données Candidat (Identique à la fiche HTML)
            var y = 58;
            var addGridRow = function (lbl1, val1, lbl2, val2, isFormationRow) {
                val1 = val1 || "";
                val2 = val2 || "";

                // Colonne 1
                doc.setTextColor(110, 110, 110);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.text(lbl1, 15, y);
                doc.setTextColor(33, 37, 41);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text(val1, 15, y + 5);

                // Colonne 2
                if (lbl2) {
                    doc.setTextColor(110, 110, 110);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.text(lbl2, 110, y);
                    doc.setTextColor(33, 37, 41);
                    if (isFormationRow) {
                        // Surlignage léger pour la formation sélectionnée
                        doc.setFillColor(254, 242, 242);
                        doc.rect(108, y - 4, 87, 10, 'F');
                        doc.setTextColor(209, 0, 0);
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(10);
                        doc.text(val2, 110, y + 3);
                    } else {
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(10);
                        doc.text(val2, 110, y + 5);
                    }
                }

                // Ligne fine sous chaque rangée
                doc.setDrawColor(245, 245, 245);
                doc.line(15, y + 8, 195, y + 8);

                y += 16;
            };

            addGridRow("Nom Complet :", fullName, "Téléphone :", phone);
            addGridRow("Sexe :", gender, "Âge :", age + " ans");
            addGridRow("Adresse E-mail :", email, "Niveau d'Étude :", education);
            addGridRow("Profession / Occupation :", profession, "Formation Sélectionnée :", formation, true);

            // Lignes pleine largeur pour Adresse et Date
            addGridRow("Adresse Physique :", address, null, null);
            addGridRow("Date de Rentrée Souhaitée :", date, null, null);

            // Ligne pour Commentaire
            doc.setTextColor(110, 110, 110);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text("Commentaire / Attentes :", 15, y);
            doc.setTextColor(80, 80, 80);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.5);
            var commentLines = doc.splitTextToSize(comment, 180);
            doc.text(commentLines, 15, y + 5);

            // Pied de page
            doc.setDrawColor(220, 220, 220);
            doc.line(15, 270, 195, 270);

            doc.setFontSize(8.5);
            doc.setTextColor(140, 140, 140);
            doc.setFont("helvetica", "normal");
            doc.text("Généré le " + genDateString + " via le portail officiel de la Salle du Numérique.", 15, 277);
            doc.setTextColor(209, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.text("Salle du numerique", 168, 277);

            return doc;
        };

        // Créer l'objet document jsPDF
        var doc = null;
        try {
            doc = generatePDFDoc();
        } catch (e) {
            console.error("Échec de la génération initiale du document PDF :", e);
        }

        // Action de Téléchargement PDF classique (avec méthode robuste)
        $('#btnDownloadPDF').off('click').on('click', function () {
            if (!doc) {
                alert("Le fichier PDF n'a pas pu être généré (le module PDF est indisponible).");
                return;
            }
            var safeName = fullName.trim().replace(/[^a-zA-Z0-9]/g, '_') || "Candidat";
            var fileName = 'Fiche_Inscription_' + safeName + '_' + randomCode + '.pdf';

            // Détection iOS pour le bouton classique également
            const ua = navigator.userAgent;
            const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;

            if (isIOS) {
                try {
                    const pdfBlob = doc.output('blob');
                    const blobUrl = URL.createObjectURL(pdfBlob);
                    window.open(blobUrl, '_blank');
                    return;
                } catch (err) {
                    console.error("Échec d'ouverture directe sur iOS:", err);
                }
            }

            try {
                // Tenter la méthode native jsPDF
                doc.save(fileName);
            } catch (err) {
                console.warn("Échec de doc.save(), tentative de téléchargement alternatif...", err);
                try {
                    // Fallback alternatif via Blob URL (très robuste sur mobile/Safari)
                    var pdfBlob = doc.output('blob');
                    var blobUrl = URL.createObjectURL(pdfBlob);
                    var link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 100);
                } catch (altErr) {
                    console.error("Erreur lors du téléchargement alternatif du PDF :", altErr);
                    alert("Le téléchargement du PDF a échoué. Vous pouvez faire une capture d'écran de cette fiche ou utiliser l'envoi WhatsApp.");
                }
            }
        });

        // ============================================================
        // WHATSAPP SHARE — Logique ES6+ Cross-Browser (4 étapes)
        // ============================================================
        $('#btnShareWhatsApp').off('click').on('click', async function () {
            const $btn = $(this);

            // Détection iOS
            const ua = navigator.userAgent;
            const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;

            // Masquer d'abord l'aide iOS au cas où
            $('#iosDownloadHelp').addClass('d-none');
            $('#btnIosDownloadPdf').attr('href', '#');

            let iosTab = null;
            if (isIOS) {
                // Ouvrir immédiatement l'onglet pour contourner le blocage de popups de Safari
                iosTab = window.open('', '_blank');
                if (iosTab) {
                    iosTab.document.write(`
                        <html>
                        <head>
                            <title>Fiche d'Inscription - SNU</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <style>
                                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; text-align: center; padding: 50px 20px; color: #333; background-color: #f8f9fa; }
                                .spinner { border: 4px solid rgba(0,0,0,0.1); border-left-color: #d10000; height: 40px; width: 40px; border-radius: 50%; animation: spin 1s linear infinite; margin: 30px auto; }
                                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                h1 { font-size: 1.4rem; margin-bottom: 12px; font-weight: 700; color: #111; }
                                p { font-size: 0.95rem; color: #666; max-width: 320px; margin: 0 auto; line-height: 1.5; }
                            </style>
                        </head>
                        <body>
                            <div class="spinner"></div>
                            <h1>Génération du PDF...</h1>
                            <p>Veuillez patienter pendant que nous générons votre fiche d'inscription officielle.</p>
                        </body>
                        </html>
                    `);
                }
            }

            // Helper : afficher un statut dans la barre de progression
            const setStatus = (msg, iconClass, iconColor, progress) => {
                $('#waStatusBox').removeClass('d-none');
                $('#waStatusIcon').attr('class', `fa ${iconClass}`).css('color', iconColor);
                $('#waStatusMsg').html(msg);
                $('#waProgressBar').css('width', `${progress}%`);
            };

            const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

            // Helper : Télécharger le PDF de manière robuste sur tous supports
            const triggerDownload = (pdfDoc, nameFile) => {
                if (isIOS) {
                    try {
                        const blob = pdfDoc.output('blob');
                        const url = URL.createObjectURL(blob);
                        if (iosTab) {
                            iosTab.location.href = url;
                        }
                        // Configurer le bouton de secours dans le modal
                        $('#iosDownloadHelp').removeClass('d-none');
                        $('#btnIosDownloadPdf').attr('href', url);
                        return true;
                    } catch (err) {
                        console.error("Échec génération Blob sur iOS :", err);
                        return false;
                    }
                }

                try {
                    pdfDoc.save(nameFile);
                    return true;
                } catch (err) {
                    console.warn("Échec de doc.save(), tentative alternative...", err);
                    try {
                        const blob = pdfDoc.output('blob');
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = nameFile;
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        setTimeout(() => URL.revokeObjectURL(url), 2000);
                        return true;
                    } catch (altErr) {
                        console.error("Tous les téléchargements ont échoué :", altErr);
                        return false;
                    }
                }
            };

            // Désactiver le bouton pour éviter les doubles clics
            $btn.prop('disabled', true).css('opacity', '0.8');

            try {
                const safeName = fullName.trim().replace(/[^a-zA-Z0-9à-ÿ]/g, '_') || 'Candidat';
                const fileName = `Fiche_Inscription_${safeName}_${randomCode}.pdf`;

                // ------------------------------------------------
                // ÉTAPE 1 — Génération du PDF
                // ------------------------------------------------
                setStatus('Génération du PDF en cours...', 'fa-spinner fa-spin', '#d10000', 15);
                await sleep(700);

                if (!doc) {
                    alert("Le PDF n'a pas pu être généré. Rechargez la page et réessayez.");
                    $btn.prop('disabled', false).css('opacity', '1');
                    $('#waStatusBox').addClass('d-none');
                    if (isIOS && iosTab) {
                        iosTab.close();
                    }
                    return;
                }

                // ------------------------------------------------
                // ÉTAPE 2 — Téléchargement du PDF
                // ------------------------------------------------
                setStatus('Téléchargement du PDF...', 'fa-download', '#d10000', 50);
                await sleep(400);

                const downloadOk = triggerDownload(doc, fileName);

                if (downloadOk) {
                    setStatus('Téléchargement terminé', 'fa-check-circle', '#22c55e', 70);
                } else {
                    setStatus('Échec du téléchargement automatique', 'fa-exclamation-triangle', '#ef4444', 70);
                }
                await sleep(800);

                // ------------------------------------------------
                // ÉTAPE 3 — Préparation du lien WhatsApp
                // ------------------------------------------------
                setStatus('Ouverture de WhatsApp...', 'fa-spinner fa-spin', '#25D366', 90);
                await sleep(700);

                const waMsg =
                    `Bonjour,\n\n` +
                    `Veuillez trouver ci-joint ma fiche d'inscription.\n\n` +
                    `Nom : ${fullName}\n` +
                    `Code : ${randomCode}\n` +
                    `Formation : ${formation}\n\n` +
                    `Le fichier PDF a été téléchargé sur mon appareil et sera envoyé en pièce jointe.\n\n` +
                    `Merci.`;

                const waUrl = `https://wa.me/243972147721?text=${encodeURIComponent(waMsg)}`;

                // Mettre à jour l'URL du bouton dans le modal
                $('#btnModalOpenWhatsApp').attr('href', waUrl);

                // Tenter une ouverture automatique
                let autoOpened = false;
                try {
                    const ua = navigator.userAgent;
                    const isMobile = /android|iphone|ipad|ipod/i.test(ua);
                    if (isMobile) {
                        // Sur mobile, rediriger la page courante fonctionne très bien pour lancer l'app
                        window.location.href = waUrl;
                        autoOpened = true;
                    } else {
                        // Sur desktop, essayer d'ouvrir dans un nouvel onglet
                        const win = window.open(waUrl, '_blank');
                        if (win && !win.closed) {
                            autoOpened = true;
                        }
                    }
                } catch (e) {
                    console.warn("Ouverture automatique bloquée par le navigateur :", e);
                }

                setStatus('Opération terminée', 'fa-check-circle', '#22c55e', 100);
                await sleep(500);

                $('#waStatusBox').addClass('d-none');

                // Afficher le modal de confirmation (qui contient maintenant le bouton fonctionnel et direct)
                const confirmModal = new bootstrap.Modal(document.getElementById('waConfirmModal'));
                confirmModal.show();

            } catch (globalErr) {
                console.error('Erreur WhatsApp Share:', globalErr);
                setStatus('Une erreur est survenue. Réessayez.', 'fa-exclamation-triangle', '#ef4444', 0);
                await sleep(2000);
                $('#waStatusBox').addClass('d-none');
                if (isIOS && iosTab) {
                    try { iosTab.close(); } catch (e) { }
                }
            } finally {
                $btn.prop('disabled', false).css('opacity', '1');
            }
        });

        // Rendre visible la fiche d'inscription
        $('#registrationFormContainer').addClass('d-none');
        $('#registrationReceiptContainer').removeClass('d-none');
    });

    $('#btnBackToForm').click(function () {
        $('#enrollmentForm').removeClass('was-validated');
        $('#registrationReceiptContainer').addClass('d-none');
        $('#registrationFormContainer').removeClass('d-none');
    });

    // Gestion du formulaire de contact avec enregistrement en temps réel
    var requestedFormation = new URLSearchParams(window.location.search).get('formation');
    if (requestedFormation && $('#contactSubject').length) {
        $('#contactSubject').val('Demande d’information - ' + requestedFormation);
    }

    // ── GESTIONNAIRE GLOBAL D'INSCRIPTION FORMATION SANS QUITTER LA PAGE ──
    $(document).on('click', '.btn-open-formation-modal, a[href*="contact.html?formation="]', function (e) {
        e.preventDefault();
        var formation = $(this).attr('data-formation') || '';
        if (!formation) {
            var href = $(this).attr('href') || '';
            if (href.indexOf('formation=') !== -1) {
                try {
                    formation = decodeURIComponent(href.split('formation=')[1].split('&')[0]);
                } catch (err) {}
            }
        }
        if ($('#modalFormationSelect').length && formation) {
            var select = $('#modalFormationSelect');
            var matched = false;
            select.find('option').each(function () {
                var optVal = $(this).val().toLowerCase();
                var search = formation.toLowerCase();
                if (optVal.includes(search) || search.includes(optVal)) {
                    select.val($(this).val());
                    matched = true;
                    return false;
                }
            });
            if (!matched && formation.trim()) {
                select.append($('<option>', { value: formation, text: formation, selected: true }));
            }
        }
        var modalEl = document.getElementById('formationModal');
        if (modalEl) {
            try {
                var modal = (window.bootstrap && window.bootstrap.Modal) ?
                    ((bootstrap.Modal.getInstance && bootstrap.Modal.getInstance(modalEl)) || new bootstrap.Modal(modalEl)) : null;
                if (modal && typeof modal.show === 'function') {
                    modal.show();
                } else if (window.$ && typeof $(modalEl).modal === 'function') {
                    $(modalEl).modal('show');
                }
            } catch (err) {
                if (window.$ && typeof $(modalEl).modal === 'function') {
                    $(modalEl).modal('show');
                }
            }
        }
    });

    function escapeReceiptText(value) {
        return String(value == null || value === '' ? 'Non renseigné' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function getAdminWhatsAppNumber() {
        var configured = window.__SNU_CONTENT__ && window.__SNU_CONTENT__.general && window.__SNU_CONTENT__.general.whatsapp;
        return String(configured || '+243 972 147 721').replace(/\D/g, '');
    }

    function createRegistrationPdf(data, reference) {
        if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('Le générateur PDF est indisponible. Rechargez la page puis réessayez.');
        var Pdf = window.jspdf.jsPDF;
        var doc = new Pdf({ unit: 'mm', format: 'a4' });
        doc.setFillColor(209, 0, 0);
        doc.rect(0, 0, 210, 39, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('SALLE DU NUMERIQUE', 15, 17);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Universite de Lubumbashi - UNILU', 15, 25);
        doc.text('FICHE OFFICIELLE DE DEMANDE D’INSCRIPTION', 15, 32);

        doc.setTextColor(209, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Reference : ' + reference, 15, 51);

        var rows = [
            ['Formation', data.formation], ['Nom complet', data.name], ['Telephone / WhatsApp', data.phone],
            ['Adresse e-mail', data.email], ['Statut', data.statut], ['Faculte / Promotion', data.faculte],
            ['Session souhaitee', data.creneau], ['Remarques', data.remarques]
        ];
        var y = 64;
        rows.forEach(function(row) {
            var valueLines = doc.splitTextToSize(String(row[1] || 'Non renseigne'), 125);
            var rowHeight = Math.max(13, valueLines.length * 5 + 7);
            if (y + rowHeight > 267) {
                doc.addPage();
                y = 20;
            }
            doc.setDrawColor(225, 228, 232);
            doc.line(15, y + rowHeight, 195, y + rowHeight);
            doc.setTextColor(100, 108, 116);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(row[0], 15, y + 5);
            doc.setTextColor(32, 36, 42);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(valueLines, 65, y + 5);
            y += rowHeight;
        });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(115, 120, 126);
        doc.text('Demande transmise a la Salle du Numerique. La confirmation definitive sera communiquee par l’equipe.', 15, Math.min(y + 12, 280), { maxWidth: 180 });
        doc.text('Emise le ' + new Date().toLocaleString('fr-FR'), 15, 288);
        return doc.output('blob');
    }

    function registrationReceiptMarkup(data, reference) {
        var rows = [
            ['Formation', data.formation], ['Nom complet', data.name], ['Téléphone / WhatsApp', data.phone],
            ['Adresse e-mail', data.email], ['Statut', data.statut], ['Faculté / Promotion', data.faculte],
            ['Session souhaitée', data.creneau], ['Remarques', data.remarques], ['Référence', reference]
        ];
        return `<div class="snu-print-sheet"><div class="snu-print-head"><img src="img/Logo_SNU.jpg" alt="Logo SNU"><div><h1>Salle du Numérique</h1><p>Université de Lubumbashi — UNILU</p><p>Fiche officielle de demande d’inscription</p></div></div><div class="snu-print-ref">Référence : ${escapeReceiptText(reference)}</div><table><tbody>${rows.map(function(row) { return `<tr><th>${escapeReceiptText(row[0])}</th><td>${escapeReceiptText(row[1])}</td></tr>`; }).join('')}</tbody></table><p class="snu-print-note">Cette fiche confirme la transmission de votre demande à la Salle du Numérique. L’inscription définitive est confirmée par l’équipe.</p><p class="snu-print-date">Émise le ${escapeReceiptText(new Date().toLocaleString('fr-FR'))}</p></div>`;
    }

    function openRegistrationReceipt(data, reference, pdfBlob) {
        if (!document.getElementById('registrationReceiptStyles')) {
            var receiptStyles = document.createElement('style');
            receiptStyles.id = 'registrationReceiptStyles';
            receiptStyles.textContent = '.snu-print-sheet{padding:18px;border:1px solid #e5e7eb;border-radius:12px;background:#fff}.snu-print-head{display:flex;align-items:center;gap:16px;padding-bottom:14px;border-bottom:3px solid #d10000}.snu-print-head img{width:64px;height:64px;object-fit:contain}.snu-print-head h1{font-size:1.25rem;color:#d10000;margin:0 0 4px}.snu-print-head p{margin:2px 0;color:#59616a}.snu-print-ref{margin:16px 0;color:#d10000;font-weight:700}.snu-print-sheet table{width:100%;border-collapse:collapse}.snu-print-sheet th,.snu-print-sheet td{text-align:left;padding:10px;border-bottom:1px solid #e5e7eb;vertical-align:top}.snu-print-sheet th{width:34%;color:#59616a}.snu-print-note{margin-top:18px;font-size:.88rem;color:#59616a}.snu-print-date{margin-top:20px;font-size:.8rem;color:#777}';
            document.head.appendChild(receiptStyles);
        }
        var modalId = 'registrationReceiptModal';
        var existing = document.getElementById(modalId);
        if (existing) existing.remove();
        var modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `<div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content border-0 shadow-lg"><div class="modal-header text-white" style="background:#d10000"><h5 class="modal-title">Votre fiche d’inscription PDF</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fermer"></button></div><div class="modal-body"><div id="registrationReceiptPrintArea">${registrationReceiptMarkup(data, reference)}</div><div class="alert alert-success mt-3 mb-0">La fiche PDF a été transmise à l’administration avec votre demande.</div></div><div class="modal-footer flex-wrap"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Fermer</button><button type="button" class="btn btn-outline-danger" id="printRegistrationReceipt"><i class="fa fa-print me-2"></i>Ouvrir / imprimer le PDF</button><button type="button" class="btn btn-danger" id="downloadRegistrationPdf"><i class="fa fa-download me-2"></i>Télécharger le PDF</button><button type="button" class="btn btn-success" id="sendRegistrationReceiptWhatsApp"><i class="fab fa-whatsapp me-2"></i>Envoyer à l’admin sur WhatsApp</button></div></div></div>`;
        document.body.appendChild(modal);

        var modalApi = window.bootstrap && window.bootstrap.Modal ? new window.bootstrap.Modal(modal) : null;
        if (modalApi) modalApi.show();
        else { modal.classList.add('show'); modal.style.display = 'block'; modal.setAttribute('aria-modal', 'true'); }

        modal.querySelector('#printRegistrationReceipt').addEventListener('click', function() {
            var printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Autorisez les fenêtres contextuelles pour ouvrir et imprimer le PDF.');
                return;
            }
            var pdfUrl = URL.createObjectURL(pdfBlob);
            printWindow.location.href = pdfUrl;
        });

        modal.querySelector('#downloadRegistrationPdf').addEventListener('click', function() {
            var pdfUrl = URL.createObjectURL(pdfBlob);
            var link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'Fiche_Inscription_' + reference + '.pdf';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(function() { URL.revokeObjectURL(pdfUrl); }, 60000);
        });

        modal.querySelector('#sendRegistrationReceiptWhatsApp').addEventListener('click', function() {
            var message = [
                'Bonjour, je vous transmets ma demande d’inscription à la Salle du Numérique.',
                'Référence : ' + reference,
                'Formation : ' + data.formation,
                'Nom : ' + data.name,
                'La fiche PDF a été envoyée dans la messagerie admin. Je joins aussi le PDF dans WhatsApp.',
                'Merci.'
            ].join('\n');
            window.open('https://wa.me/' + getAdminWhatsAppNumber() + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
        });
    }

    // Soumission AJAX du formulaire d'inscription formation
    $('#formationRegistrationForm').submit(function (e) {
        e.preventDefault();
        var form = this;
        var submitBtn = $('#modalSubmitBtn');
        var originalText = submitBtn.html();

        var formation = $('#modalFormationSelect').val() || "Formation Générale";
        var name = $('#modalNomApprenant').val().trim();
        var phone = $('#modalPhoneApprenant').val().trim();
        var email = $('#modalEmailApprenant').val().trim();
        var statut = $('#modalStatutApprenant').val() || "Étudiant UNILU";
        var creneau = $('#modalCreneauApprenant').val() || "Session standard";
        var faculte = $('#modalFaculteApprenant').val().trim() || "Non spécifiée";
        var remarques = $('#modalRemarquesApprenant').val().trim() || "Aucune remarque particulière.";
        var refCode = 'SNU-FRM-' + Date.now().toString().slice(-8);

        var msgBody = "Fiche PDF d'inscription jointe à cette demande. Référence : " + refCode;

        var payload = {
            type: 'inscription',
            formation: formation,
            statut: statut,
            creneau: creneau,
            faculte: faculte,
            remarques: remarques,
            name: name,
            phone: phone,
            email: email,
            subject: "Inscription Formation : " + formation,
            message: msgBody,
            website: $(form).find('input[name="website"]').val() || ""
        };

        var receiptData = {
            formation: formation,
            name: name,
            phone: phone,
            email: email,
            statut: statut,
            faculte: faculte,
            creneau: creneau,
            remarques: remarques
        };
        var pdfBlob;
        try {
            pdfBlob = createRegistrationPdf(receiptData, refCode);
        } catch (pdfError) {
            $('#formationAlertError').removeClass('d-none').text(pdfError.message || 'Impossible de créer la fiche PDF.');
            return;
        }

        submitBtn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin me-2"></i> Enregistrement...');
        $('#formationAlertSuccess').addClass('d-none');
        $('#formationAlertError').addClass('d-none');

        function makeRegistrationRequestOptions() {
            var registrationFormData = new FormData();
            registrationFormData.append('data', JSON.stringify(payload));
            registrationFormData.append('pdf', pdfBlob, 'Fiche_Inscription_' + refCode + '.pdf');
            return { method: 'POST', body: registrationFormData };
        }
        // Utiliser d’abord la route du site (proxy Netlify ou serveur local).
        // Un aperçu statique peut répondre 404/405 aux POST; dans ce cas, envoyer
        // la demande au backend de production au lieu d’arrêter le formulaire.
        var registrationRequest = fetch('/api/messages', makeRegistrationRequestOptions()).then(function(res) {
            if (res.status === 404 || res.status === 405) {
                return fetch(API_URL + '/api/messages', makeRegistrationRequestOptions());
            }
            return res;
        });
        registrationRequest
        .then(function (res) {
            return res.text().then(function (body) {
                var responseData = null;
                if (body.trim()) {
                    try {
                        responseData = JSON.parse(body);
                    } catch (parseError) {
                        if (!res.ok) throw new Error('Le serveur a refusé la demande (HTTP ' + res.status + ').');
                        throw new Error('Le serveur a répondu dans un format invalide. Réessayez dans un instant.');
                    }
                }
                if (!res.ok) {
                    throw new Error((responseData && responseData.error) || 'Impossible de transmettre la demande (HTTP ' + res.status + ').');
                }
                // Certaines passerelles confirment une requête acceptée sans corps JSON.
                // Le statut HTTP 2xx suffit alors pour poursuivre vers la fiche.
                if (!body.trim()) return { success: true };
                return responseData;
            });
        })
        .then(function (data) {
            if (!data.success) throw new Error(data.error || 'Erreur lors de l’inscription');
            var showReceipt = function() { openRegistrationReceipt(receiptData, refCode, pdfBlob); };
            var formModal = form.closest('.modal');
            var formModalApi = formModal && window.bootstrap && window.bootstrap.Modal ? window.bootstrap.Modal.getInstance(formModal) : null;
            if (formModalApi && formModal.classList.contains('show')) {
                formModal.addEventListener('hidden.bs.modal', showReceipt, { once: true });
                formModalApi.hide();
            } else {
                showReceipt();
            }
            $('#formationAlertSuccess').removeClass('d-none').html(
                '<i class="fa fa-check-circle me-2"></i><strong>Votre demande a été transmise !</strong> Référence : <code>' + refCode + '</code>. Votre fiche est ouverte.'
            );
            form.reset();
            $('#modalFormationSelect').val(formation);
        })
        .catch(function (err) {
            $('#formationAlertError').removeClass('d-none').text(err.message || 'Erreur de transmission.');
        })
        .finally(function () {
            submitBtn.prop('disabled', false).html(originalText);
        });
    });

    // ── SOUMISSION DU FORMULAIRE DE RÉSERVATION DE LA SALLE (CONTRAT SNU) ──
    $('#reservationForm').submit(function (e) {
        e.preventDefault();
        var form = this;
        var submitBtn = $(form).find('#resSubmitBtn');
        var originalText = submitBtn.html();

        var org = $('#resOrg').val().trim();
        var rep = $('#resRep').val().trim();
        var phone = $('#resPhone').val().trim();
        var email = $('#resEmail').val().trim();
        var date = $('#resDate').val();
        var participants = $('#resParticipants').val();
        var typeAct = $('#resType').val();
        var details = $('#resDetails').val().trim();

        var msgBody = "=== DEMANDE DE RÉSERVATION DE LA SALLE (CONTRAT SNU) ===\n" +
                      "Structure / Organisation : " + org + "\n" +
                      "Représentant responsable : " + rep + "\n" +
                      "Téléphone : " + phone + "\n" +
                      "Email : " + email + "\n" +
                      "Nature de l'activité : " + typeAct + "\n" +
                      "Date souhaitée : " + date + "\n" +
                      "Participants attendus : " + participants + " personnes (Capacité max 90)\n" +
                      "Besoins matériels & Détails : " + details;

        var payload = {
            type: 'reservation',
            name: rep + " (" + org + ")",
            phone: phone,
            email: email,
            subject: "Réservation Salle SNU : " + typeAct + " (" + date + ")",
            message: msgBody,
            website: $(form).find('input[name="website"]').val() || ""
        };

        submitBtn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin me-2"></i> Transmission...');
        $('#reservationAlertSuccess').addClass('d-none');
        $('#reservationAlertError').addClass('d-none');

        var apiUrl = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? '/api/messages' : (API_URL + '/api/messages');
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (!data.success) throw new Error(data.error || 'Erreur de transmission');
            var refCode = 'SNU-RES-' + Math.floor(1000 + Math.random() * 9000);
            $('#reservationAlertSuccess').removeClass('d-none').html(
                '<i class="fa fa-check-circle me-2"></i><strong>Demande de réservation transmise avec succès !</strong> Référence : <code>' + refCode + '</code>.<br>' +
                'La Direction de la Salle du Numérique examinera votre dossier et vous contactera sous 24h ouvrées.'
            );
            form.reset();
        })
        .catch(function (err) {
            $('#reservationAlertError').removeClass('d-none').text(err.message || 'Erreur lors de la transmission.');
        })
        .finally(function () {
            submitBtn.prop('disabled', false).html(originalText);
        });
    });

    $('#contactForm').submit(function (e) {
        e.preventDefault();
        var form = this;
        if (!form.checkValidity()) {
            e.stopPropagation();
            $(form).addClass('was-validated');
            return;
        }

        var submitBtn = $(form).find('button[type="submit"]');
        var originalBtnHtml = submitBtn.html();
        submitBtn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin me-2"></i> Envoi en cours...');

        var msgData = {
            type: 'message',
            name: $('#contactName').val().trim(),
            email: $('#contactEmail').val().trim(),
            phone: $('#contactPhone').val().trim(),
            subject: $('#contactSubject').val().trim(),
            message: $('#contactMessage').val().trim()
        };

        msgData.website = $('#website').val().trim();

        // Envoi sécurisé au serveur
        var apiUrl = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? '/api/messages' : (API_URL + '/api/messages');
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msgData)
        })
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            if (!data.success) throw new Error(data.error || 'Envoi impossible');
            $('#contactAlert').removeClass('d-none alert-danger').addClass('alert-success animate__animated animate__fadeIn').html('<i class="fa fa-check-circle me-2"></i>Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
            form.reset();
            $(form).removeClass('was-validated');
        })
        .catch(function (err) {
            $('#contactAlert').removeClass('alert-success d-none').addClass('alert-danger').text(err.message || 'Impossible d’envoyer le message.');
        })
        .finally(function () {
            submitBtn.prop('disabled', false).html(originalBtnHtml);
            setTimeout(function () {
                $('#contactAlert').addClass('d-none');
            }, 6000);
        });
    });

    // Géolocalisation navigateur : la carte suit la position autorisée de la machine,
    // avec un repli explicite sur l'Université de Lubumbashi si la permission échoue.
    (function initUniluMapLocation() {
        var map = document.getElementById('uniluMap');
        if (!map || !navigator.geolocation) return;

        var fallback = map.getAttribute('data-fallback-map') || '-11.6033,27.4691';
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude.toFixed(6);
            var lng = position.coords.longitude.toFixed(6);
            map.src = 'https://www.google.com/maps?q=' + lat + ',' + lng + '&z=16&output=embed';
        }, function () {
            map.src = 'https://www.google.com/maps?q=' + fallback + '&z=16&output=embed';
        }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 });
    })();

    // Générateur dynamique de favicon circulaire
    function makeFaviconCircular() {
        var logoUrl = 'img/Logo_SNU.jpg';
        var img = new Image();
        img.onload = function () {
            try {
                var canvas = document.createElement('canvas');
                canvas.width = 128;
                canvas.height = 128;
                var ctx = canvas.getContext('2d');

                // Cercle de découpe
                ctx.beginPath();
                ctx.arc(64, 64, 62, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                // Dessiner l'image du logo
                ctx.drawImage(img, 0, 0, 128, 128);

                // Ajouter une fine bordure blanche pour la visibilité sur les onglets sombres
                ctx.beginPath();
                ctx.arc(64, 64, 62, 0, Math.PI * 2);
                ctx.closePath();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.stroke();

                // Mettre à jour toutes les balises de favicon
                var faviconLinks = document.querySelectorAll("link[rel*='icon']");
                var circularDataUrl = canvas.toDataURL('image/png');

                if (faviconLinks.length === 0) {
                    var newLink = document.createElement('link');
                    newLink.rel = 'icon';
                    newLink.type = 'image/png';
                    newLink.href = circularDataUrl;
                    document.head.appendChild(newLink);
                } else {
                    for (var i = 0; i < faviconLinks.length; i++) {
                        faviconLinks[i].href = circularDataUrl;
                        faviconLinks[i].type = 'image/png';
                    }
                }
            } catch (err) {
                console.error("Erreur favicon circulaire :", err);
            }
        };
        img.src = logoUrl;
    }

    // Lancer au chargement
    makeFaviconCircular();

    var CLAUDIA_BACKEND = (window.CLAUDIA_BACKEND_URL || API_URL).replace(/\/$/, '');
    var CLAUDIA_API = CLAUDIA_BACKEND + '/claudia/ask';
    var CLAUDIA_STATUS_API = CLAUDIA_BACKEND + '/claudia/status';

    var claudiaState = 'idle';   // idle | listening | thinking | speaking
    var claudiaRecognition = null;
    var claudiaLoopActive = false;    // true = boucle conversation active
    var claudiaCurrentAudio = null;


    // ─── Utilitaires visuels — Widget vocal premium ─────────
    function setClaudiaState(state) {
        claudiaState = state;
        var btn = document.getElementById('claudiaVoiceBtn');
        var head = document.getElementById('claudiaHead');
        var visualizer = document.getElementById('claudiaVisualizer');
        var statusEl = document.getElementById('claudiaStatus');
        var micBtn = document.getElementById('claudiaMicBtn');
        var hintEl = document.getElementById('claudiaHint');
        var dot = document.getElementById('claudiaDot');
        var states = ['idle', 'listening', 'thinking', 'speaking'];

        // Synchroniser les classes état sur btn, head, visualizer
        [btn, head, visualizer].forEach(function (el) {
            if (!el) return;
            states.forEach(function (s) { el.classList.remove('state-' + s); });
            if (state !== 'idle') el.classList.add('state-' + state);
        });

        // Couleur du point status en haut à droite du bouton
        var dotColors = { idle: '#ffffff', listening: '#ff9999', thinking: '#ff3333', speaking: '#ffffff' };
        if (dot) dot.style.background = dotColors[state] || '#22c55e';

        // Icône et classe active sur le bouton micro
        if (micBtn) {
            micBtn.classList.toggle('active', state === 'listening');
            var micIcons = { idle: 'fa-microphone', listening: 'fa-stop', thinking: 'fa-spinner fa-spin', speaking: 'fa-volume-up' };
            var micLabels = { idle: 'Commencer à parler', listening: 'Arrêter l\'écoute', thinking: 'Patiente...', speaking: 'Interrompre' };
            micBtn.querySelector('i').className = 'fa ' + (micIcons[state] || 'fa-microphone');
            var micLabelEl = document.getElementById('claudiaMicLabel');
            if (micLabelEl) micLabelEl.textContent = micLabels[state] || micLabels.idle;
        }

        // Texte de statut dans l'en-tête
        var labels = {
            idle: 'Prête — cliquez sur le micro',
            listening: 'J\'écoute… parlez maintenant',
            thinking: 'Claudia réfléchit…',
            speaking: 'Claudia parle…'
        };
        if (statusEl) statusEl.textContent = labels[state] || labels.idle;

        // Hint re-listen
        if (hintEl) hintEl.style.display = (state === 'idle' && claudiaLoopActive) ? 'block' : 'none';
    }

    function updateClaudiaCounter(remaining) {
        var el = document.getElementById('claudiaQCounter');
        if (!el) return;
        el.textContent = remaining + ' question' + (remaining > 1 ? 's' : '') + ' restante' + (remaining > 1 ? 's' : '');
        el.style.color = remaining <= 2 ? '#ef4444' : '#22c55e';
    }

    // ─── Synthèse vocale navigateur (Compatibilité iOS & Safari) ────────
    var isSpeechUnlocked = false;
    function unlockIOSSpeech() {
        if (isSpeechUnlocked || !('speechSynthesis' in window)) return;
        try {
            var silentUtterance = new SpeechSynthesisUtterance(' ');
            silentUtterance.volume = 0.01;
            window.speechSynthesis.speak(silentUtterance);
            isSpeechUnlocked = true;
        } catch (e) { }
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = function () {
            try { window.speechSynthesis.getVoices(); } catch (e) { }
        };
    }

    function claudiaSpeak(text, onDone) {
        // Arrêter l'audio en cours si présent
        if (claudiaCurrentAudio) { claudiaCurrentAudio.pause(); claudiaCurrentAudio = null; }

        if (!('speechSynthesis' in window)) {
            setClaudiaState('idle');
            if (onDone) onDone();
            return;
        }

        // Sur iOS, débloquer au préalable si nécessaire
        unlockIOSSpeech();

        // Si Claudia est déjà en train de parler, annuler l'ancienne phrase
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        setClaudiaState('speaking');

        // Nettoyer les émojis et caractères non vocaux
        var cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '');

        var utter = new SpeechSynthesisUtterance(cleanText);
        utter.lang = 'fr-FR';
        utter.rate = 0.93;
        utter.pitch = 1.05;
        utter.volume = 1.0;

        // Détection de la voix française avec priorité absolue à Alice (et fallback voix féminines)
        var voices = window.speechSynthesis.getVoices() || [];
        var frVoice = voices.find(function (v) {
            var name = v.name.toLowerCase();
            var l = (v.lang || '').replace('_', '-').toLowerCase();
            return l.startsWith('fr') && name.includes('alice');
        }) || voices.find(function (v) {
            var name = v.name.toLowerCase();
            var l = (v.lang || '').replace('_', '-').toLowerCase();
            return l.startsWith('fr') && (
                name.includes('female') ||
                name.includes('amélie') ||
                name.includes('audrey') ||
                name.includes('denise') ||
                name.includes('hortense') ||
                name.includes('celine') ||
                name.includes('céline') ||
                name.includes('google')
            );
        }) || voices.find(function (v) {
            var l = (v.lang || '').replace('_', '-').toLowerCase();
            return l.startsWith('fr');
        });

        if (frVoice) utter.voice = frVoice;

        utter.onend = function () {
            setClaudiaState('idle');
            if (onDone) onDone();
        };
        utter.onerror = function (err) {
            console.warn('[Claudia] Speech error:', err);
            setClaudiaState('idle');
            if (onDone) onDone();
        };

        window.claudiaUtterance = utter; // Éviter garbage collection Chrome/iOS

        // Petit délai sécurisé pour iOS Safari
        setTimeout(function () {
            try {
                window.speechSynthesis.speak(utter);
            } catch (e) {
                console.error('[Claudia] Speak failed:', e);
                setClaudiaState('idle');
                if (onDone) onDone();
            }
        }, 50);
    }

    // ─── Envoi de question au backend ──────────────────────
    function askClaudia(question) {
        if (!question || !question.trim()) {
            if (claudiaLoopActive) startListening();
            return;
        }

        var textEl = document.getElementById('claudiaSpeakText');
        var inputEl = document.getElementById('claudiaInput');

        if (textEl) textEl.innerHTML = '<em>Claudia réfléchit…</em>';
        if (inputEl) { inputEl.value = question; inputEl.disabled = true; }
        setClaudiaState('thinking');

        fetch(CLAUDIA_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: question.trim(),
                local_hour: new Date().getHours()
            })
        })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (inputEl) { inputEl.disabled = false; inputEl.value = ''; }

                if (data.success) {
                    var answer = data.answer || '';
                    if (textEl) textEl.innerHTML = answer.replace(/\n/g, '<br>');
                    updateClaudiaCounter(data.remaining !== undefined ? data.remaining : 0);

                    // Claudia parle, puis réécoute automatiquement si boucle active
                    claudiaSpeak(answer, function () {
                        if (claudiaLoopActive) {
                            setTimeout(startListening, 600);
                        }
                    });

                } else if (data.error === 'rate_limit') {
                    var msg = data.message || 'Limite atteinte.';
                    if (textEl) textEl.innerHTML = '<strong style="color:#ef4444">Limite atteinte.</strong><br>' + msg;
                    claudiaSpeak(msg, function () { claudiaLoopActive = false; setClaudiaState('idle'); });
                } else {
                    if (textEl) textEl.textContent = 'Erreur. Réessayez.';
                    setClaudiaState('idle');
                    if (claudiaLoopActive) setTimeout(startListening, 1000);
                }
            })
            .catch(function (err) {
                console.error('[Claudia] Erreur réseau :', err);
                if (inputEl) inputEl.disabled = false;
                if (textEl) textEl.innerHTML = 'Service indisponible.<br>Contactez-nous au <strong>+243 972 147 721</strong>.';
                setClaudiaState('idle');
            });

    }

    // ─── Reconnaissance vocale (Web Speech API) ────────────
    function startListening() {
        if (claudiaState === 'listening' || claudiaState === 'thinking' || claudiaState === 'speaking') return;

        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            var textEl = document.getElementById('claudiaSpeakText');
            if (textEl) textEl.innerHTML = '<strong style="color:red">Votre navigateur ne supporte pas la reconnaissance vocale.</strong><br>Tapez votre question ci-dessous.';
            return;
        }

        // Arrêter la synthèse en cours si Claudia parlait encore
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();

        claudiaRecognition = new SpeechRecognition();
        claudiaRecognition.lang = 'fr-FR';
        claudiaRecognition.interimResults = false;
        claudiaRecognition.maxAlternatives = 1;
        claudiaRecognition.continuous = false;

        claudiaRecognition.onstart = function () {
            setClaudiaState('listening');
        };

        claudiaRecognition.onresult = function (event) {
            var transcript = event.results[0][0].transcript;
            var inputEl = document.getElementById('claudiaInput');
            if (inputEl) inputEl.value = transcript;
            setClaudiaState('thinking');
            askClaudia(transcript);
        };

        claudiaRecognition.onerror = function (event) {
            setClaudiaState('idle');
            var textEl = document.getElementById('claudiaSpeakText');
            if (event.error === 'not-allowed') {
                claudiaLoopActive = false;
                if (textEl) textEl.innerHTML = '<strong style="color:red">Microphone bloqué.</strong><br>Autorisez l\'accès au micro dans votre navigateur puis réessayez.';
            } else if (event.error === 'no-speech') {
                if (textEl) textEl.innerHTML = '<em>Je n\'ai rien entendu. Parlez à nouveau ou tapez votre question.</em>';
                // Réécouter si boucle active
                if (claudiaLoopActive) setTimeout(startListening, 800);
            } else {
                if (textEl) textEl.innerHTML = '<em>Erreur micro : ' + event.error + '. Tapez votre question.</em>';
                if (claudiaLoopActive) setTimeout(startListening, 1200);
            }
        };

        claudiaRecognition.onend = function () {
            if (claudiaState === 'listening') setClaudiaState('idle');
        };

        try {
            claudiaRecognition.start();
        } catch (e) {
            console.error('Erreur démarrage reconnaissance vocale:', e);
        }
    }

    function stopListening() {
        if (claudiaRecognition) {
            try { claudiaRecognition.stop(); } catch (e) { }
            claudiaRecognition = null;
        }
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        claudiaLoopActive = false;
        setClaudiaState('idle');
        var textEl = document.getElementById('claudiaSpeakText');
        if (textEl) textEl.innerHTML = 'Conversation terminée. Cliquez sur <i class="fa fa-microphone"></i> pour recommencer.';
    }

    // ─── Vérification backend ───────────────────────────────
    function checkClaudiaBackend(speakGreeting) {
        fetch(CLAUDIA_STATUS_API, { method: 'GET' })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data.status === 'online') {
                    var textEl = document.getElementById('claudiaSpeakText');
                    if (textEl) textEl.innerHTML = 'Bonjour, je suis <strong>Claudia</strong>.<br>Votre guide de la Salle du Numérique.<br><br>Je vous écoute...';
                    updateClaudiaCounter(data.remaining_questions || 10);
                    if (speakGreeting) {
                        // Salutation puis réécoute automatique
                        claudiaSpeak('Bonjour, je suis Claudia, votre guide de la Salle du Numérique. Comment puis-je vous aider ?', function () {
                            claudiaLoopActive = true;
                            startListening();
                        });
                    }
                }
            })
            .catch(function () {
                var textEl = document.getElementById('claudiaSpeakText');
                if (textEl) textEl.innerHTML = 'Service Claudia indisponible.<br>Contactez-nous au <strong>+243 972 147 721</strong>.';
            });
    }

    // ─── Ouvrir / Fermer le panneau ────────────────────────
    var claudiaVoiceBtn = document.getElementById('claudiaVoiceBtn');
    if (claudiaVoiceBtn) {
        claudiaVoiceBtn.addEventListener('click', function () {
            unlockIOSSpeech();
            var modal = document.getElementById('claudiaSpeakModal');
            if (!modal) return;

            if (modal.style.display === 'none' || modal.style.display === '') {
                // Ouvrir le panneau
                modal.style.display = 'block';
                modal.style.opacity = '0';
                modal.style.transform = 'translateY(10px)';
                modal.style.transition = 'opacity 0.25s, transform 0.25s';
                setTimeout(function () {
                    modal.style.opacity = '1';
                    modal.style.transform = 'translateY(0)';
                }, 10);
                // Vérifier backend et lancer salutation
                checkClaudiaBackend(true);
            } else {
                // Fermer
                stopListening();
                modal.style.opacity = '0';
                modal.style.transform = 'translateY(10px)';
                setTimeout(function () { modal.style.display = 'none'; }, 250);
            }
        });
    }

    // Bouton Fermer
    var claudiaCloseBtn = document.getElementById('claudiaCloseBtn');
    if (claudiaCloseBtn) {
        claudiaCloseBtn.addEventListener('click', function () {
            var modal = document.getElementById('claudiaSpeakModal');
            stopListening();
            if (modal) {
                modal.style.opacity = '0';
                modal.style.transform = 'translateY(10px)';
                setTimeout(function () { modal.style.display = 'none'; }, 250);
            }
        });
    }

    // ─── Bouton microphone : toggle écoute ─────────────────
    var claudiaMicBtn = document.getElementById('claudiaMicBtn');
    if (claudiaMicBtn) {
        claudiaMicBtn.addEventListener('click', function () {
            unlockIOSSpeech();
            if (claudiaState === 'listening') {
                // Stopper l'écoute
                if (claudiaRecognition) { try { claudiaRecognition.stop(); } catch (e) { } }
                claudiaLoopActive = false;
                setClaudiaState('idle');
            } else if (claudiaState === 'idle') {
                // Démarrer boucle conversation
                claudiaLoopActive = true;
                startListening();
            } else if (claudiaState === 'speaking') {
                // Interrompre Claudia et réécouter
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                claudiaLoopActive = true;
                setTimeout(startListening, 300);
            }
        });
    }

    // ─── Touche ESPACE = démarrer/stopper ──────────────────
    document.addEventListener('keydown', function (e) {
        var modal = document.getElementById('claudiaSpeakModal');
        var isVisible = modal && modal.style.display === 'block';

        // Ignorer si on est dans un champ de saisie
        var tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        if (e.code === 'Space' && isVisible) {
            e.preventDefault();
            if (claudiaState === 'listening') {
                if (claudiaRecognition) { try { claudiaRecognition.stop(); } catch (e2) { } }
                claudiaLoopActive = false;
                setClaudiaState('idle');
            } else if (claudiaState === 'idle') {
                claudiaLoopActive = true;
                startListening();
            } else if (claudiaState === 'speaking') {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                claudiaLoopActive = true;
                setTimeout(startListening, 300);
            }
        }
    });

    // ─── Raccourci direct vers l'espace Administration (/admin ou /admi) ───
    (function initAdminShortcuts() {
        // Redirection si l'URL porte #admin, #admi, ?admin ou ?admi
        var hash = (window.location.hash || '').toLowerCase();
        var search = (window.location.search || '').toLowerCase();
        if (hash === '#admin' || hash === '#admi' || search.indexOf('admin') !== -1 || search.indexOf('admi') !== -1) {
            window.location.href = '/admin/';
            return;
        }

        // Frappe clavier rapide : si l'utilisateur tape "/admin" ou "/admi" sur la page
        var typedBuffer = '';
        var resetTimer = null;
        document.addEventListener('keydown', function (e) {
            var tag = document.activeElement ? document.activeElement.tagName : '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            clearTimeout(resetTimer);
            typedBuffer += e.key.toLowerCase();
            if (typedBuffer.length > 10) typedBuffer = typedBuffer.slice(-10);

            if (typedBuffer.endsWith('/admin') || typedBuffer.endsWith('/admi')) {
                window.location.href = '/admin/';
            }

            resetTimer = setTimeout(function () {
                typedBuffer = '';
            }, 2000);
        });
    })();

    // ─── Vérification initiale (silencieuse) ───────────────
    setTimeout(function () { checkClaudiaBackend(false); }, 1500);

})(jQuery);
