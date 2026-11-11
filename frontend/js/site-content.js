/**
 * CLAUDIA SNU - Site Content Dynamic Synchronization
 * Permet de synchroniser les textes et images du site public avec les modifications effectuées depuis l'espace Admin.
 */
window.API_URL = window.API_URL || "https://backend-eueq.onrender.com";

(function () {
    'use strict';

    var STORAGE_KEY = 'snu_site_content';

    function resolveMediaUrl(url) {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
            return url;
        }
        var clean = url.replace(/^\//, '');
        if (clean.startsWith('img/uploads/') && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
            var backend = (window.API_URL || 'https://backend-eueq.onrender.com').replace(/\/$/, '');
            return backend + '/' + clean + '?v=' + Date.now();
        }
        return url;
    }

    function getNestedValue(obj, path) {
        if (!obj || !path) return null;
        var parts = path.split('.');
        var curr = obj;
        for (var i = 0; i < parts.length; i++) {
            if (curr && typeof curr === 'object' && parts[i] in curr) {
                curr = curr[parts[i]];
            } else {
                return null;
            }
        }
        return curr;
    }

    function applySiteContent(data) {
        if (!data) return;
        window.__SNU_CONTENT__ = data;

        // 1. Textes génériques avec [data-cms]
        var textEls = document.querySelectorAll('[data-cms]');
        textEls.forEach(function (el) {
            var key = el.getAttribute('data-cms');
            var val = getNestedValue(data, key);
            if (val !== null && val !== undefined) {
                el.innerHTML = val;
            }
        });

        // 2. Images avec [data-cms-img]
        var imgEls = document.querySelectorAll('[data-cms-img]');
        imgEls.forEach(function (el) {
            var key = el.getAttribute('data-cms-img');
            var val = getNestedValue(data, key);
            if (val) {
                el.setAttribute('src', resolveMediaUrl(val));
                el.hidden = false;
            } else if (val !== null && val !== undefined) {
                el.removeAttribute('src');
                el.hidden = true;
            }
        });

        // Les photos illustratives de la section À propos sont facultatives.
        // Masquer leur tuile et élargir le texte quand elles sont supprimées.
        if (data.about) {
            var aboutImageStates = [1, 2].map(function(index) {
                var img = document.querySelector('[data-cms-img="about.img' + index + '"]');
                var tile = img && img.closest('.col-6');
                var src = data.about['img' + index];
                if (img && tile) {
                    if (src) {
                        img.setAttribute('src', resolveMediaUrl(src));
                        tile.style.display = '';
                    } else {
                        img.removeAttribute('src');
                        tile.style.display = 'none';
                    }
                }
                return { tile: tile, visible: Boolean(img && tile && src) };
            });
            var visibleAboutTiles = aboutImageStates.filter(function(state) { return state.visible; });
            visibleAboutTiles.forEach(function(state) {
                state.tile.classList.toggle('col-6', visibleAboutTiles.length === 2);
                state.tile.classList.toggle('col-12', visibleAboutTiles.length === 1);
            });
            var imagesColumn = document.getElementById('aboutImagesColumn');
            var textColumn = document.getElementById('aboutTextColumn');
            if (imagesColumn && textColumn) {
                var hasAboutImages = visibleAboutTiles.length > 0;
                imagesColumn.style.display = hasAboutImages ? '' : 'none';
                textColumn.classList.toggle('col-lg-6', hasAboutImages);
                textColumn.classList.toggle('col-lg-12', !hasAboutImages);
            }
        }

        // 3. Liens avec [data-cms-href]
        var linkEls = document.querySelectorAll('[data-cms-href]');
        linkEls.forEach(function (el) {
            var key = el.getAttribute('data-cms-href');
            var val = getNestedValue(data, key);
            if (val) {
                el.setAttribute('href', val);
            } else if (val !== null && val !== undefined) {
                el.removeAttribute('href');
            }
        });

        // 4. Icônes avec [data-cms-icon]
        var iconEls = document.querySelectorAll('[data-cms-icon]');
        iconEls.forEach(function (el) {
            var key = el.getAttribute('data-cms-icon');
            var val = getNestedValue(data, key);
            if (val) {
                // Conserver les classes utilitaires (ex: fa-3x, text-primary, mb-3)
                var currentClasses = Array.from(el.classList).filter(function(c) {
                    return !c.startsWith('fa-') || ['fa-3x', 'fa-2x', 'fa-lg', 'fa-sm'].indexOf(c) !== -1;
                });
                var iconName = val.startsWith('fa-') ? val : ('fa-' + val);
                el.className = 'fa ' + iconName + ' ' + currentClasses.join(' ');
            } else if (val !== null && val !== undefined) {
                el.className = Array.from(el.classList).filter(function(c) {
                    return !c.startsWith('fa-') || ['fa-3x', 'fa-2x', 'fa-lg', 'fa-sm'].indexOf(c) !== -1;
                }).join(' ');
            }
        });

        // 4. Carrousel Hero (si présent)
        if (data.hero && Array.isArray(data.hero.slides)) {
            var $hero = window.jQuery ? window.jQuery('.header-carousel') : null;
            if ($hero && $hero.length) {
                try {
                    if ($hero.data('owl.carousel')) $hero.trigger('destroy.owl.carousel');
                    $hero[0].innerHTML = '';
                    data.hero.slides.filter(Boolean).forEach(function (src, idx) {
                        var slide = document.createElement('img');
                        slide.className = 'w-100';
                        slide.alt = 'Salle du Numérique — photo ' + (idx + 1);
                        slide.src = resolveMediaUrl(src);
                        $hero[0].appendChild(slide);
                    });
                    if (data.hero.slides.filter(Boolean).length && typeof $hero.owlCarousel === 'function') {
                        $hero.owlCarousel({ items: 1, autoplay: true, smartSpeed: 1000, loop: data.hero.slides.filter(Boolean).length > 1, dots: true });
                    }
                } catch (e) {
                    // Si la bibliothèque carousel est indisponible, les images directes
                    // ont tout de même reçu les nouvelles sources.
                }
            }
        }

        // 5. Équipe de gestion (si présente)
        if (data.team && Array.isArray(data.team.members)) {
            var teamCards = document.querySelectorAll('.snu-team-card');
            teamCards.forEach(function (card, idx) {
                var m = data.team.members[idx];
                if (!m) return;
                var img = card.querySelector('img');
                var name = card.querySelector('.snu-name');
                var role = card.querySelector('.snu-role');
                if (img && m.img) img.setAttribute('src', resolveMediaUrl(m.img));
                if (name && m.name) name.textContent = m.name;
                if (role && m.role) role.textContent = m.role;
            });
        }

        // 6. Services (dynamique : ajout, modification, suppression)
        if (data.services && Array.isArray(data.services.items)) {
            var firstCard = document.querySelector('.service-card');
            var srvContainer = document.getElementById('servicesContainer') || (firstCard ? firstCard.closest('.row') : null);
            if (srvContainer) {
                srvContainer.innerHTML = '';
                data.services.items.forEach(function (s, idx) {
                    var col = document.createElement('div');
                    col.className = 'col-lg-4 col-md-6 wow fadeInUp';
                    var delay = (0.1 * ((idx % 3) + 1)).toFixed(1) + 's';
                    col.setAttribute('data-wow-delay', delay);
                    col.innerHTML = `
                        <div class="service-card p-4 d-flex flex-column align-items-center text-center" data-service-key="${s.id || ''}" data-service-title="${(s.title || '').replace(/"/g, '&quot;')}" tabindex="0" role="button">
                            <div class="text-center mb-3" style="font-size: 3.5rem; color: var(--accent-blue) !important;">
                                <i class="${s.icon || 'fa fa-desktop'}"></i>
                            </div>
                            <h4 class="mb-3" style="color: #1a1a1a; font-weight: 700;">${s.title || ''}</h4>
                            <p class="mb-0 text-muted" style="font-size: 0.9rem; line-height: 1.6;">${s.desc || ''}</p>
                            <span class="service-hint small text-primary mt-3 d-inline-block fw-bold"><i class="fa fa-info-circle me-1"></i>Cliquer pour voir les détails</span>
                        </div>
                    `;
                    srvContainer.appendChild(col);
                });
            }
        }

        // 7. Formations Principales (dynamique : ajout, modification, suppression)
        if (data.formations && Array.isArray(data.formations.principales)) {
            var princContainer = document.getElementById('formationsPrincipalesContainer');
            if (princContainer) {
                princContainer.innerHTML = '';
                var colClass = data.formations.principales.length <= 3 ? 'col-lg-4 col-md-6' : 'col-lg-3 col-md-6';
                data.formations.principales.forEach(function (f, idx) {
                    var col = document.createElement('div');
                    col.className = colClass + ' wow fadeInUp';
                    var delay = (0.1 * ((idx % 4) + 1)).toFixed(1) + 's';
                    col.setAttribute('data-wow-delay', delay);
                    col.innerHTML = `
                        <div class="formation-card p-4 d-flex flex-column h-100 text-center">
                            <div class="text-center mb-3" style="font-size: 3.5rem; color: #d10000;">
                                <i class="${f.icon || 'fa fa-graduation-cap'}"></i>
                            </div>
                            <h5 class="mb-3" style="font-weight: 700; color: #1a1a1a;">${f.title || ''}</h5>
                            <p class="text-muted small mb-4" style="line-height: 1.6;">${f.desc || ''}</p>
                            <button type="button" class="btn btn-primary w-100 mt-auto py-2 btn-open-formation-modal" data-formation="${f.title || ''}" data-bs-toggle="modal" data-bs-target="#formationModal">
                                <i class="fa fa-user-plus me-1"></i>S'inscrire à cette formation
                            </button>
                        </div>
                    `;
                    princContainer.appendChild(col);
                });
            }
        }

        // 7b. Modules Spécifiques (dynamique : ajout, modification, suppression)
        if (data.formations && Array.isArray(data.formations.modules)) {
            var modContainer = document.getElementById('formationsModulesContainer');
            if (modContainer) {
                modContainer.innerHTML = '';
                data.formations.modules.forEach(function (m, idx) {
                    var col = document.createElement('div');
                    col.className = 'col-lg-4 col-md-6 wow fadeInUp';
                    var delay = (0.1 * ((idx % 3) + 1)).toFixed(1) + 's';
                    col.setAttribute('data-wow-delay', delay);
                    col.innerHTML = `
                        <div class="formation-card p-4 d-flex flex-column h-100">
                            <div class="d-flex align-items-center mb-3">
                                <i class="${m.icon || 'far fa-file-alt'} fs-1 me-3" style="color: #d10000;"></i>
                                <h5 class="mb-0" style="font-weight: 700; color: #1a1a1a;">${m.title || ''}</h5>
                            </div>
                            <p class="text-muted small mb-4" style="line-height: 1.6;">${m.desc || ''}</p>
                            <button type="button" class="btn btn-outline-danger btn-sm w-100 mt-auto py-2 btn-open-module-modal" data-module="${m.title || ''}">
                                <i class="fa fa-file-signature me-1"></i>Demander ce module
                            </button>
                        </div>
                    `;
                    modContainer.appendChild(col);
                });
            }
        }

        // 7c. Mettre à jour la liste déroulante du formulaire d'inscription
        if (data.formations) {
            var regSelect = document.getElementById('regFormation');
            if (regSelect) {
                var currentVal = regSelect.value;
                regSelect.innerHTML = '<option value="" disabled selected>Choisir la formation...</option>';
                if (data.formations.principales && data.formations.principales.length) {
                    var grp1 = document.createElement('optgroup');
                    grp1.label = 'Formations Principales';
                    data.formations.principales.forEach(function (f) {
                        var opt = document.createElement('option');
                        opt.value = f.title;
                        opt.textContent = f.title;
                        grp1.appendChild(opt);
                    });
                    regSelect.appendChild(grp1);
                }
                if (data.formations.modules && data.formations.modules.length) {
                    var grp2 = document.createElement('optgroup');
                    grp2.label = 'Modules Spécifiques';
                    data.formations.modules.forEach(function (m) {
                        var opt = document.createElement('option');
                        opt.value = m.title;
                        opt.textContent = m.title;
                        grp2.appendChild(opt);
                    });
                    regSelect.appendChild(grp2);
                }
                if (currentVal) regSelect.value = currentVal;
            }
        }

        // 8. Actualités
        if (data.news && Array.isArray(data.news.items)) {
            var newsContainer = document.getElementById('newsContainer');
            if (newsContainer) {
                newsContainer.innerHTML = '';
                data.news.items.forEach(function (item, index) {
                    var col = document.createElement('div');
                    col.className = 'col-md-6 col-lg-4';
                    col.innerHTML = `
                        <article class="news-card h-100" data-news-index="${index}" tabindex="0" role="button" aria-label="Lire l’actualité : ${item.title || 'Actualité'}">
                            <img src="${resolveMediaUrl(item.img || 'img/Salle1.jpg')}" alt="${item.title || 'Actualité de la Salle du Numérique'}" class="news-card-img">
                            <div class="p-4">
                                <div class="small text-danger fw-bold mb-2">${item.category || 'Actualité'} · ${item.date || ''}</div>
                                <h3 class="h5">${item.title || ''}</h3>
                                <p class="text-muted mb-0">${item.excerpt || ''}</p>
                                <span class="small text-primary fw-bold mt-3 d-inline-block"><i class="fa fa-info-circle me-1"></i>Cliquer pour lire la suite</span>
                            </div>
                        </article>`;
                    newsContainer.appendChild(col);
                });
                newsContainer.dataset.newsItems = JSON.stringify(data.news.items);
            }
        }

        // 8b. Équipe de la Salle du Numérique
        if (data.team && Array.isArray(data.team.members)) {
            var teamContainer = document.getElementById('teamContainer') || document.querySelector('.snu-team-section .row');
            if (teamContainer) {
                teamContainer.innerHTML = '';
                data.team.members.forEach(function (m) {
                    var col = document.createElement('div');
                    col.className = 'col-sm-6 col-lg-4';
                    col.innerHTML = `
                        <article class="snu-team-card h-100">
                            <div class="snu-img-wrap"><img src="${resolveMediaUrl(m.img || 'img/Logo_SNU.jpg')}" alt="${m.name || 'Membre de l\'équipe'}, ${m.role || 'Fonction'}"></div>
                            <div class="snu-info">
                                <div class="snu-name">${m.name || ''}</div>
                                <div class="snu-role">${m.role || ''}</div>
                            </div>
                        </article>`;
                    teamContainer.appendChild(col);
                });
            }
        }

        // 9. Témoignages (Ce que pensent nos apprenants)
        if (data.testimonials) {
            var tTitle = document.querySelector('[data-cms="testimonials.main_title"]');
            var tSub = document.querySelector('[data-cms="testimonials.subtitle"]');
            if (tTitle && data.testimonials.main_title) tTitle.innerHTML = data.testimonials.main_title;
            if (tSub && data.testimonials.subtitle) tSub.innerHTML = data.testimonials.subtitle;

            if (Array.isArray(data.testimonials.items)) {
                var testCarousel = document.querySelector('.testimonial-carousel');
                if (testCarousel) {
                    var $carousel = window.jQuery ? window.jQuery(testCarousel) : null;
                    if ($carousel && $carousel.data('owl.carousel')) {
                        try {
                            $carousel.trigger('destroy.owl.carousel');
                            $carousel.find('.owl-stage-outer').children().unwrap();
                            $carousel.removeClass('owl-center owl-loaded owl-text-select-on');
                        } catch(e) {}
                    }
                    testCarousel.innerHTML = '';
                    data.testimonials.items.forEach(function (t) {
                        var itemDiv = document.createElement('div');
                        itemDiv.className = 'testimonial-item';
                        itemDiv.innerHTML = `
                            <div class="row g-5 align-items-center">
                                <div class="col-md-6">
                                    <div class="testimonial-img">
                                        <img class="img-fluid" src="${resolveMediaUrl(t.img || 'img/testimonial-1.jpeg')}" alt="${t.name || ''}">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="testimonial-text pb-5 pb-md-0">
                                        <h3>${t.title || ''}</h3>
                                        <p>${t.text || ''}</p>
                                        <h5 class="mb-0">${t.name || ''}</h5>
                                        <span class="text-primary">${t.role || ''}</span>
                                    </div>
                                </div>
                            </div>`;
                        testCarousel.appendChild(itemDiv);
                    });
                    if ($carousel && typeof $carousel.owlCarousel === 'function') {
                        $carousel.owlCarousel({
                            items: 1,
                            autoplay: true,
                            smartSpeed: 1000,
                            animateIn: 'fadeIn',
                            animateOut: 'fadeOut',
                            dots: true,
                            loop: data.testimonials.items.length > 1,
                            nav: false
                        });
                    }
                }
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // DÉTAILS DES SERVICES (Image, description et équipements par service)
    // ════════════════════════════════════════════════════════════════════════
    var SERVICE_DETAILS_DATA = {
        'espaces_prives': {
            title: 'Espaces de Travail Privés',
            icon: 'fa fa-laptop',
            badge: 'Bureaux individuels calmes',
            img: 'img/Salle3.jpg',
            desc: 'Des boxes et bureaux individuels modernes spécialement aménagés pour les étudiants, chercheurs et porteurs de projet. Cet espace calme et isolé vous offre un bureau individuel spacieux, un fauteuil grand confort, des prises électriques dédiées et une connexion réseau directe pour vous concentrer pleinement sur vos projets de fin de cycle (TFC), mémoires de master ou thèses universitaires, à l\'abri des bruits et distractions.',
            features: [
                'Bureau individuel ergonomique avec grand plateau',
                'Fauteuil grand confort et lampe d\'appoint',
                'Prises électriques et ports de recharge dédiés',
                'Connexion Internet très haut débit filaire & Wi-Fi',
                'Environnement climatisé et propice à la réflexion'
            ]
        },
        'internet': {
            title: 'Connexion Internet Haut Débit',
            icon: 'fa fa-wifi',
            badge: 'Fibre optique & Wi-Fi 6',
            img: 'img/hero-bg.jpg',
            desc: 'Une connexion Internet à très haut débit alimentée par fibre optique universitaire de l\'UNILU, complétée par une couverture Wi-Fi 6 intégrale dans toute la salle. Elle est calibrée pour assurer une fluidité sans interruption lors de vos recherches, téléchargements de cours et sessions de visioconférence.',
            features: [
                'Bande passante stable et continue sans restriction de quota',
                'Couverture Wi-Fi 6 optimale pour ordinateurs et smartphones',
                'Latence ultra-faible pour conférences et visioconférences HD',
                'Accès rapide aux bibliothèques et plateformes académiques mondiales'
            ]
        },
        'postes': {
            title: 'Postes Informatiques Modernes',
            icon: 'fa fa-desktop',
            badge: '100 Ordinateurs disponibles',
            img: 'img/Salle1.jpg',
            desc: 'Un parc de 100 ordinateurs récents et performants, équipés d\'écrans larges haute définition, de claviers confortables et de logiciels à jour. Chaque poste est prêt à l\'emploi pour vos travaux pratiques, rédactions, projets de programmation et recherches documentaires.',
            features: [
                '100 ordinateurs de dernière génération prêts à l\'emploi',
                'Suite bureautique complète (Word, Excel, PowerPoint) préinstallée',
                'Outils d\'analyse, modélisation et environnements de programmation',
                'Clavier ergonomique, souris précise et ports USB accessibles'
            ]
        },
        'ressources': {
            title: 'Ressources & Bibliothèques Numériques',
            icon: 'fa fa-book',
            badge: 'Documentation scientifique',
            img: 'img/Salle2.jpg',
            desc: 'Un portail privilégié donnant accès à des milliers d\'ouvrages universitaires, thèses académiques archivées, articles scientifiques à comité de lecture et bases de données documentaires internationales partenaires de l\'UNILU.',
            features: [
                'Accès aux bases de données scientifiques (IEEE, JSTOR, ScienceDirect, Cairn)',
                'Centaines d\'e-books universitaires et manuels de cours en libre accès',
                'Recherche guidée avec l\'aide de l\'équipe documentaire',
                'Postes dédiés à la lecture confortable'
            ]
        },
        'espaces_collab': {
            title: 'Espaces Collaboratifs & Projets',
            icon: 'fa fa-users',
            badge: 'Travail en équipe & Innovation',
            img: 'img/about-2.jpg',
            desc: 'Un espace conçu pour stimuler l\'émulation, la coopération et le travail d\'équipe : préparation d\'exposés en groupe, hackathons, réunions de projets de recherche et ateliers créatifs avec mobilier modulable.',
            features: [
                'Tables modulables configurables selon la taille de votre équipe',
                'Tableaux blancs magnétiques pour vos séances de brainstorming',
                'Mobilier dynamique adapté aux sessions prolongées',
                'Multiprises intégrées pour tous vos ordinateurs portables'
            ]
        },
        'ateliers': {
            title: 'Ateliers Pratiques & Sessions Flash',
            icon: 'fa fa-chalkboard-teacher',
            badge: 'Apprentissage dynamique',
            img: 'img/project-2.jpg',
            desc: 'Des sessions courtes et interactives organisées chaque semaine (notamment durant la pause de midi) pour développer des compétences directement applicables : prise en main d\'outils d\'IA générative, cybersécurité, design graphique et automatisation.',
            features: [
                'Ateliers de 45 à 60 minutes animés par des experts du numérique',
                'Exercices pratiques en direct sur machine',
                'Questions-réponses et échanges interactifs avec les formateurs',
                'Supports de formation et fiches mémos téléchargeables'
            ]
        },
        'formations': {
            title: 'Formations Certifiantes & Modules Spécialisés',
            icon: 'fa fa-graduation-cap',
            badge: 'Montée en compétences',
            img: 'img/project-3.jpg',
            desc: 'Des formations complètes en bureautique avancée (Word pour mémoires, Excel pour analyse de données), maîtrise des outils d\'intelligence artificielle générative et design numérique adapté aux besoins académiques et professionnels.',
            features: [
                'Formateurs expérimentés et pédagogie axée sur la pratique',
                'Poste informatique individuel dédié durant chaque séance',
                'Délivrance d\'une attestation de participation Salle du Numérique',
                'Créneaux flexibles adaptés aux emplois du temps universitaires'
            ]
        },
        'accompagnement': {
            title: 'Accompagnement Technique & Orientation',
            icon: 'fa fa-comments',
            badge: 'Équipe dédiée sur place',
            img: 'img/about-1.jpg',
            desc: 'Une équipe technique et pédagogique présente en permanence à la Salle du Numérique pour vous assister : dépannage de premier niveau, orientation vers les bons outils logiciels et conseils personnalisés pour mener à bien vos projets.',
            features: [
                'Assistance technique directe au guichet d\'accueil',
                'Aide à l\'installation et configuration d\'outils académiques',
                'Conseils méthodologiques pour vos recherches et présentations',
                'Orientation bienveillante vers les parcours adaptés'
            ]
        },
        'tp': {
            title: 'Travaux Pratiques (TP) & TPE Universitaires',
            icon: 'fa fa-book-open',
            badge: 'Environnement académique dédié',
            img: 'img/Salle1.jpg',
            desc: 'Un environnement technique idéal pour les travaux dirigés et travaux pratiques prescrits par les facultés de l\'Université de Lubumbashi, avec l\'ensemble des logiciels spécialisés et environnements de programmation préconfigurés.',
            features: [
                'Environnements de travail préconfigurés et validés par les enseignants',
                'Capacité d\'accueil pour promotions entières en séances dirigées',
                'Connexion réseau et sauvegardes stables',
                'Supervision et assistance technique continue'
            ]
        }
    };

    // Alias des clés srv_1 à srv_9
    SERVICE_DETAILS_DATA['srv_1'] = SERVICE_DETAILS_DATA['postes'];
    SERVICE_DETAILS_DATA['srv_2'] = SERVICE_DETAILS_DATA['internet'];
    SERVICE_DETAILS_DATA['srv_3'] = SERVICE_DETAILS_DATA['ressources'];
    SERVICE_DETAILS_DATA['srv_4'] = SERVICE_DETAILS_DATA['espaces_prives'];
    SERVICE_DETAILS_DATA['srv_5'] = SERVICE_DETAILS_DATA['espaces_collab'];
    SERVICE_DETAILS_DATA['srv_6'] = SERVICE_DETAILS_DATA['ateliers'];
    SERVICE_DETAILS_DATA['srv_7'] = SERVICE_DETAILS_DATA['formations'];
    SERVICE_DETAILS_DATA['srv_8'] = SERVICE_DETAILS_DATA['accompagnement'];
    SERVICE_DETAILS_DATA['srv_9'] = SERVICE_DETAILS_DATA['tp'];

    // Helper universel compatible Bootstrap 5.0, 5.1+ et jQuery pour ouvrir un modal
    function openAnyBootstrapModal(modalEl) {
        if (!modalEl) return;
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');

        try {
            if (window.bootstrap && window.bootstrap.Modal) {
                var inst = null;
                if (typeof window.bootstrap.Modal.getInstance === 'function') {
                    inst = window.bootstrap.Modal.getInstance(modalEl);
                }
                if (!inst && typeof window.bootstrap.Modal.getOrCreateInstance === 'function') {
                    inst = window.bootstrap.Modal.getOrCreateInstance(modalEl);
                }
                if (!inst) {
                    inst = new window.bootstrap.Modal(modalEl);
                }
                if (inst && typeof inst.show === 'function') {
                    inst.show();
                    return;
                }
            }
        } catch (e) {
            console.warn('[Modal] Bootstrap fallback warning:', e);
        }

        try {
            if (window.$ && typeof $(modalEl).modal === 'function') {
                $(modalEl).modal('show');
                return;
            }
        } catch (e2) {}

        modalEl.classList.add('show');
        modalEl.style.display = 'block';
        modalEl.setAttribute('aria-modal', 'true');
        modalEl.removeAttribute('aria-hidden');
        var backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show snu-fallback-backdrop';
        document.body.appendChild(backdrop);
    }

    // Helper universel pour fermer un modal
    function closeAnyBootstrapModal(modalEl) {
        if (!modalEl) return;
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');

        try {
            if (window.bootstrap && window.bootstrap.Modal && typeof window.bootstrap.Modal.getInstance === 'function') {
                var inst = window.bootstrap.Modal.getInstance(modalEl);
                if (inst && typeof inst.hide === 'function') {
                    inst.hide();
                    return;
                }
            }
        } catch (e) {}
        try {
            if (window.$ && typeof $(modalEl).modal === 'function') {
                $(modalEl).modal('hide');
                return;
            }
        } catch (e2) {}
        modalEl.classList.remove('show');
        modalEl.style.display = 'none';
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.removeAttribute('aria-modal');
        document.querySelectorAll('.modal-backdrop, .snu-fallback-backdrop').forEach(function (b) { b.remove(); });
    }

    function ensureServiceDetailModal() {
        if (document.getElementById('serviceDetailModal')) return;
        var modal = document.createElement('div');
        modal.id = 'serviceDetailModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.setAttribute('aria-labelledby', 'serviceDetailModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable service-modal-dialog">
                <div class="modal-content shadow-lg border-0" style="border-radius:14px; overflow:hidden;">
                    <div class="modal-header py-3 px-4 text-white" style="background:#d10000;">
                        <div class="d-flex align-items-center">
                            <i id="serviceModalHeaderIcon" class="fa fa-laptop fs-3 me-3"></i>
                            <div>
                                <h5 class="modal-title fw-bold text-white mb-0" id="serviceDetailModalLabel" style="font-size: 1.05rem;">Détails du service</h5>
                                <small class="text-white-50" style="font-size: 0.78rem;">Salle du Numérique — UNILU</small>
                            </div>
                        </div>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body p-3 p-md-4">
                        <div class="position-relative mb-3 text-center" style="border-radius:10px; overflow:hidden; background:#f8f9fa;">
                            <img id="serviceModalImg" src="img/Salle3.jpg" alt="Aperçu du service" class="img-fluid w-100" style="max-height:260px; object-fit:cover;">
                            <div id="serviceModalBadge" class="position-absolute top-0 end-0 m-2 px-3 py-1 bg-dark text-white rounded-pill small fw-bold shadow-sm" style="font-size: 0.78rem;">
                                <i class="fa fa-check-circle text-success me-1"></i>Disponible
                            </div>
                        </div>
                        <h4 id="serviceModalTitle" class="fw-bold mb-2" style="font-size: 1.25rem;">Espaces de travail privés</h4>
                        <div class="mb-3">
                            <p id="serviceModalDesc" class="text-muted mb-0" style="font-size:0.95rem; line-height:1.6;"></p>
                        </div>
                        <div class="mb-3 p-3 rounded bg-light border">
                            <h6 class="fw-bold text-uppercase text-danger small mb-2" style="font-size:0.78rem; letter-spacing:0.5px;"><i class="fa fa-check-square me-2"></i>Équipements inclus</h6>
                            <ul id="serviceModalFeatures" class="list-unstyled row g-2 small mb-0"></ul>
                        </div>
                        <div class="d-flex flex-wrap gap-2 justify-content-end pt-2 border-top">
                            <button type="button" class="btn btn-sm btn-outline-secondary px-3 py-2" data-bs-dismiss="modal">Fermer</button>
                            <a href="project.html#contact" class="btn btn-sm btn-primary px-3 py-2 fw-bold">
                                <i class="fa fa-envelope me-1"></i>Nous contacter
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }

    function showServiceDetail(serviceKey, titleHint) {
        ensureServiceDetailModal();
        var modalEl = document.getElementById('serviceDetailModal');
        if (!modalEl) return;

        var key = (serviceKey || '').toLowerCase().trim();
        var data = SERVICE_DETAILS_DATA[key];
        if (!data && titleHint) {
            var lower = titleHint.toLowerCase();
            if (lower.includes('priv') || lower.includes('bureau') || lower.includes('box')) data = SERVICE_DETAILS_DATA['espaces_prives'];
            else if (lower.includes('internet') || lower.includes('wifi') || lower.includes('connexion')) data = SERVICE_DETAILS_DATA['internet'];
            else if (lower.includes('ordinat') || lower.includes('poste') || lower.includes('100')) data = SERVICE_DETAILS_DATA['postes'];
            else if (lower.includes('ressource') || lower.includes('biblio') || lower.includes('livre')) data = SERVICE_DETAILS_DATA['ressources'];
            else if (lower.includes('collab') || lower.includes('équipe')) data = SERVICE_DETAILS_DATA['espaces_collab'];
            else if (lower.includes('atelier') || lower.includes('midi')) data = SERVICE_DETAILS_DATA['ateliers'];
            else if (lower.includes('format')) data = SERVICE_DETAILS_DATA['formations'];
            else if (lower.includes('accomp') || lower.includes('échange') || lower.includes('cadre')) data = SERVICE_DETAILS_DATA['accompagnement'];
            else if (lower.includes('tp') || lower.includes('tpe') || lower.includes('pratique')) data = SERVICE_DETAILS_DATA['tp'];
        }

        // Fallback générique si non trouvé
        if (!data) {
            data = {
                title: titleHint || 'Service Salle du Numérique',
                icon: 'fa fa-laptop',
                badge: 'Disponible',
                img: 'img/Salle2.jpg',
                desc: 'Ce service est mis à la disposition des étudiants, enseignants et chercheurs de l\'Université de Lubumbashi pour soutenir leurs activités académiques et professionnelles.',
                features: [
                    'Équipements récents et performants',
                    'Accompagnement par l\'équipe de la Salle du Numérique',
                    'Accès direct aux infrastructures numériques UNILU'
                ]
            };
        }

        var titleEl = document.getElementById('serviceModalTitle');
        var descEl = document.getElementById('serviceModalDesc');
        var imgEl = document.getElementById('serviceModalImg');
        var badgeEl = document.getElementById('serviceModalBadge');
        var iconEl = document.getElementById('serviceModalHeaderIcon');
        var featEl = document.getElementById('serviceModalFeatures');

        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;
        if (imgEl) {
            imgEl.src = resolveMediaUrl(data.img);
            imgEl.alt = data.title;
        }
        if (badgeEl) badgeEl.innerHTML = '<i class="fa fa-check-circle text-success me-1"></i>' + data.badge;
        if (iconEl && data.icon) iconEl.className = data.icon + ' fs-2 me-3';

        if (featEl && data.features) {
            featEl.innerHTML = data.features.map(function (f) {
                return '<li class="col-md-6 text-muted mb-2"><i class="fa fa-check text-danger me-2"></i>' + f + '</li>';
            }).join('');
        }

        var linksWrap = document.getElementById('serviceLibraryLinks');
        if (linksWrap) linksWrap.remove();
        var currentContent = window.__SNU_CONTENT__ || {};
        var currentService = (currentContent.services && currentContent.services.items || []).find(function (service) {
            return service.id === key || (service.title || '').toLowerCase().includes('biblioth');
        });
        var defaultLibraryLinks = [
            {label: 'Google Scholar', url: 'https://scholar.google.com/'},
            {label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/'},
            {label: 'DOAJ', url: 'https://doaj.org/'},
            {label: 'CORE', url: 'https://core.ac.uk/'},
            {label: 'JSTOR', url: 'https://www.jstor.org/'},
            {label: 'Internet Archive', url: 'https://archive.org/'}
        ];
        var libraryLinks = currentService && Array.isArray(currentService.links) ? currentService.links : defaultLibraryLinks;
        if (featEl && featEl.parentElement) featEl.parentElement.style.display = '';
        var isLibraryService = key === 'srv_3' || key === 'ressources' || (titleHint || '').toLowerCase().includes('biblioth');
        if (imgEl && imgEl.parentElement) imgEl.parentElement.style.display = isLibraryService ? 'none' : '';
        if (isLibraryService) {
            if (descEl) descEl.textContent = '';
            if (featEl) featEl.innerHTML = '';
            linksWrap = document.createElement('div');
            linksWrap.id = 'serviceLibraryLinks';
            linksWrap.className = 'row g-2 mb-3';
            libraryLinks.filter(function(link) { return link && String(link.label || '').trim() && String(link.url || '').trim(); }).forEach(function (link) {
                var col = document.createElement('div'); col.className = 'col-md-6';
                var anchor = document.createElement('a');
                anchor.className = 'btn btn-primary w-100'; anchor.textContent = link.label || 'Ressource';
                var safeUrl = '';
                try {
                    var parsedUrl = new URL(link.url || '', window.location.href);
                    if (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') safeUrl = parsedUrl.href;
                } catch (e) {}
                anchor.href = safeUrl || '#'; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
                if (!safeUrl) { anchor.classList.add('disabled'); anchor.setAttribute('aria-disabled', 'true'); }
                col.appendChild(anchor); linksWrap.appendChild(col);
            });
            if (featEl && featEl.parentElement) {
                featEl.parentElement.style.display = 'none';
                featEl.parentElement.insertAdjacentElement('afterend', linksWrap);
            }
        }

        openAnyBootstrapModal(modalEl);
    }

    function showNewsDetail(item) {
        if (!item) return;
        var modalEl = document.getElementById('newsDetailModal');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'newsDetailModal';
            modalEl.className = 'modal fade';
            modalEl.tabIndex = -1;
            modalEl.setAttribute('aria-labelledby', 'newsDetailModalLabel');
            modalEl.setAttribute('aria-hidden', 'true');
            modalEl.innerHTML = `
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable news-modal-dialog">
                    <div class="modal-content shadow-lg border-0" style="border-radius:14px; overflow:hidden;">
                        <div class="modal-header py-3 px-4 text-white" style="background:#d10000;">
                            <div><h5 class="modal-title fw-bold text-white mb-0" id="newsDetailModalLabel">Détail de l’actualité</h5><small class="text-white-50">Salle du Numérique — UNILU</small></div>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fermer"></button>
                        </div>
                        <div class="modal-body p-3 p-md-4">
                            <img id="newsModalImg" class="img-fluid w-100 mb-3" style="max-height:360px; object-fit:cover; border-radius:10px;" alt="">
                            <div id="newsModalMeta" class="small text-danger fw-bold mb-2"></div>
                            <h3 id="newsModalTitle" class="fw-bold mb-3"></h3>
                            <p id="newsModalText" class="text-muted mb-0" style="white-space:pre-line; line-height:1.7;"></p>
                        </div>
                    </div>
                </div>`;
            document.body.appendChild(modalEl);
        }
        var img = document.getElementById('newsModalImg');
        img.src = resolveMediaUrl(item.img || 'img/Salle1.jpg');
        img.alt = item.title || 'Actualité de la Salle du Numérique';
        document.getElementById('newsModalMeta').textContent = (item.category || 'Actualité') + (item.date ? ' · ' + item.date : '');
        document.getElementById('newsModalTitle').textContent = item.title || 'Actualité';
        document.getElementById('newsModalText').textContent = item.content || item.description || item.excerpt || '';
        openAnyBootstrapModal(modalEl);
    }

    function activateNewsCard(card) {
        var container = card.closest('#newsContainer');
        if (!container) return;
        try {
            var items = JSON.parse(container.dataset.newsItems || '[]');
            showNewsDetail(items[Number(card.getAttribute('data-news-index'))]);
        } catch (e) {}
    }

    document.addEventListener('click', function (event) {
        var card = event.target.closest('.news-card[data-news-index]');
        if (card && !event.target.closest('a, button')) activateNewsCard(card);
    });

    document.addEventListener('keydown', function (event) {
        var card = event.target.closest && event.target.closest('.news-card[data-news-index]');
        if (card && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            activateNewsCard(card);
        }
    });

    // Gestionnaire de clic sur les cartes de service
    document.addEventListener('click', function (event) {
        var card = event.target.closest('.service-card');
        if (!card) return;
        if (event.target.closest('a, button')) return;

        var key = card.getAttribute('data-service-key') || '';
        var heading = card.querySelector('h3, h4, h5');
        var titleText = heading ? heading.textContent.trim() : (card.getAttribute('data-service-title') || '');
        showServiceDetail(key, titleText);
    });

    // Fermeture universelle des modals via bouton data-bs-dismiss et clic à l'extérieur
    document.addEventListener('click', function (event) {
        var dismissBtn = event.target.closest('[data-bs-dismiss="modal"]');
        if (dismissBtn) {
            var modal = dismissBtn.closest('.modal');
            if (modal) {
                closeAnyBootstrapModal(modal);
            }
            return;
        }
        if (event.target && event.target.classList && event.target.classList.contains('modal') && event.target.classList.contains('show')) {
            closeAnyBootstrapModal(event.target);
        }
    });

    // ════════════════════════════════════════════════════════════════════════
    // MODAL D'EXPLICATION DES ATOUTS HERO (Accueil : Ordinateurs, Connexion, Espaces)
    // ════════════════════════════════════════════════════════════════════════
    function ensureHeroFeatModal() {
        if (document.getElementById('heroFeatModal')) return;
        var modal = document.createElement('div');
        modal.id = 'heroFeatModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.setAttribute('aria-labelledby', 'heroFeatModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable hero-feat-modal-dialog">
                <div class="modal-content shadow-lg border-0" style="border-radius:14px; overflow:hidden;">
                    <div class="modal-header py-3 px-4 text-white" style="background:#d10000;">
                        <div class="d-flex align-items-center">
                            <i id="heroFeatHeaderIcon" class="fa fa-desktop fs-3 me-3"></i>
                            <div>
                                <h5 class="modal-title fw-bold text-white mb-0" id="heroFeatModalLabel" style="font-size: 1.05rem;">Présentation de l'infrastructure</h5>
                                <small class="text-white-50" style="font-size: 0.78rem;">Salle du Numérique — UNILU</small>
                            </div>
                        </div>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body p-3 p-md-4">
                        <div class="position-relative mb-3 text-center" style="border-radius:10px; overflow:hidden; background:#f8f9fa;">
                            <img id="heroFeatImg" src="img/Salle1.jpg" alt="Aperçu" class="img-fluid w-100" style="max-height:260px; object-fit:cover;">
                            <div id="heroFeatBadge" class="position-absolute top-0 end-0 m-2 px-3 py-1 bg-dark text-white rounded-pill small fw-bold shadow-sm" style="font-size: 0.78rem;">
                                <i class="fa fa-check-circle text-success me-1"></i>Infrastructure SNU
                            </div>
                        </div>
                        <h4 id="heroFeatTitle" class="fw-bold mb-2" style="font-size: 1.25rem;">Ordinateurs Modernes</h4>
                        <div class="mb-3">
                            <p id="heroFeatDesc" class="text-muted mb-0" style="font-size: 0.95rem; line-height: 1.6;"></p>
                        </div>
                        <div class="d-flex flex-wrap gap-2 justify-content-end pt-3 border-top">
                            <button type="button" class="btn btn-sm btn-outline-secondary px-3 py-2" data-bs-dismiss="modal">Fermer</button>
                            <a href="services.html" class="btn btn-sm btn-primary px-3 py-2 fw-bold">
                                <i class="fa fa-th-large me-1"></i>Voir tous nos services
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }

    function showHeroFeatDetail(featId) {
        ensureHeroFeatModal();
        var modalEl = document.getElementById('heroFeatModal');
        if (!modalEl) return;

        var heroData = (window.__SNU_CONTENT__ && window.__SNU_CONTENT__.hero) ? window.__SNU_CONTENT__.hero : {};

        var title = '';
        var desc = '';
        var img = '';
        var icon = 'fa fa-desktop';

        if (featId === '1') {
            title = heroData.feat_1_title || 'Ordinateurs Modernes';
            desc = heroData.feat_1_desc || "La Salle du Numérique met à votre disposition un parc informatique récent composé de plus de 100 ordinateurs de dernière génération. Chaque poste est configuré avec des écrans haute définition, des composants rapides et tous les logiciels bureautiques, de développement et de recherche indispensables pour vos études et projets.";
            img = heroData.feat_1_img || 'img/Salle1.jpg';
            icon = heroData.feat_1_icon || 'fa fa-desktop';
        } else if (featId === '2') {
            title = heroData.feat_2_title || 'Connexion Ultra Rapide';
            desc = heroData.feat_2_desc || "Profitez d'un accès internet dédié par fibre optique à très haut débit et à faible latence. Que ce soit pour vos recherches documentaires universitaires, le téléchargement d'articles scientifiques, le travail sur le cloud ou des conférences en ligne, notre bande passante garantit une navigation fluide et ininterrompue.";
            img = heroData.feat_2_img || 'img/Salle2.jpg';
            icon = heroData.feat_2_icon || 'fa fa-bolt';
        } else if (featId === '3') {
            title = heroData.feat_3_title || 'Espaces de Travail';
            desc = heroData.feat_3_desc || "Découvrez des environnements de travail climatisés, modernes et ergonomiques adaptés à tous vos besoins : des zones calmes pour l'étude et la rédaction individuelle, des bureaux privatifs pour les enseignants-chercheurs, et des tables modulables pour vos sessions de groupe et ateliers pratiques.";
            img = heroData.feat_3_img || 'img/Salle3.jpg';
            icon = heroData.feat_3_icon || 'fa fa-building';
        }

        var titleEl = document.getElementById('heroFeatTitle');
        var descEl = document.getElementById('heroFeatDesc');
        var imgEl = document.getElementById('heroFeatImg');
        var iconEl = document.getElementById('heroFeatHeaderIcon');

        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.textContent = desc;
        if (imgEl && img) imgEl.src = resolveMediaUrl(img);
        if (iconEl && icon) iconEl.className = icon + ' fs-2 me-3';

        openAnyBootstrapModal(modalEl);
    }

    // Gestionnaire de clic sur les cartes Hero Feat
    document.addEventListener('click', function (event) {
        var card = event.target.closest('[data-hero-feat]');
        if (!card) return;
        event.preventDefault();
        event.stopPropagation();
        var featId = card.getAttribute('data-hero-feat') || '1';
        showHeroFeatDetail(featId);
    });

    // ════════════════════════════════════════════════════════════════════════
    // GESTION DU MODAL DE DEMANDE DE MODULE (Nom complet, Email, Nom du module)
    // ════════════════════════════════════════════════════════════════════════
    function ensureModuleRequestModal() {
        var existing = document.getElementById('moduleRequestModal');
        if (!existing) {
            var modal = document.createElement('div');
            modal.id = 'moduleRequestModal';
            modal.className = 'modal fade module-request-modal';
            modal.tabIndex = -1;
            modal.setAttribute('aria-labelledby', 'moduleRequestModalLabel');
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="max-width: 480px;">
                    <div class="modal-content shadow-lg border-0" style="border-radius:14px; overflow:hidden;">
                        <div class="modal-header py-2 px-3 text-white" style="background:#d10000;">
                            <div class="d-flex align-items-center">
                                <i class="fa fa-file-signature fs-4 me-2"></i>
                                <div>
                                    <h6 class="modal-title fw-bold text-white mb-0" id="moduleRequestModalLabel" style="font-size: 0.95rem;">Demande de module</h6>
                                    <small class="text-white-50" style="font-size: 0.72rem;">Salle du Numérique — UNILU</small>
                                </div>
                            </div>
                            <button type="button" class="btn-close btn-close-white btn-sm" data-bs-dismiss="modal" aria-label="Fermer"></button>
                        </div>
                        <div class="modal-body p-3" style="background:#ffffff;">
                            <div id="moduleReqSuccessAlert" class="alert alert-success d-none mb-3" role="alert">
                                <i class="fa fa-check-circle me-2"></i><strong>Votre demande a été transmise avec succès !</strong> L'administrateur a bien reçu votre demande et vous contactera rapidement par email.
                            </div>
                            <div id="moduleReqErrorAlert" class="alert alert-danger d-none mb-3" role="alert"></div>
                            <form id="dedicatedModuleRequestForm" novalidate>
                                <input type="text" name="website" style="display:none !important" tabindex="-1" autocomplete="off">
                                <div class="mb-3">
                                    <label class="form-label fw-bold text-dark small" for="moduleReqName">Nom complet <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light text-muted"><i class="fa fa-user"></i></span>
                                        <input type="text" class="form-control" id="moduleReqName" name="name" placeholder="Ex: Kahozi Juniors" required minlength="2">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-bold text-dark small" for="moduleReqEmail">Adresse Email <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light text-muted"><i class="fa fa-envelope"></i></span>
                                        <input type="email" class="form-control" id="moduleReqEmail" name="email" placeholder="votre.email@exemple.com" required>
                                    </div>
                                    <div class="form-text small">L'administrateur vous répondra directement à cette adresse.</div>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark small" for="moduleReqModuleName">Module demandé <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light text-muted"><i class="fa fa-book"></i></span>
                                        <select class="form-select" id="moduleReqModuleName" name="module" required>
                                            <option value="" disabled selected>-- Choisissez votre module --</option>
                                            <option value="Microsoft Word">Microsoft Word (Mise en page de mémoire, TFC, rapports)</option>
                                            <option value="Microsoft Excel">Microsoft Excel (Tableaux, calculs et formules avancées)</option>
                                            <option value="Microsoft PowerPoint">Microsoft PowerPoint (Conception de présentations percutantes)</option>
                                            <option value="Microsoft Access">Microsoft Access (Gestion &amp; création de bases de données)</option>
                                            <option value="Microsoft Publisher">Microsoft Publisher (Création de brochures, affiches et PAO)</option>
                                            <option value="Microsoft SharePoint">Microsoft SharePoint (Partage documentaire et travail d'équipe)</option>
                                            <option value="Initiation à l'utilisation des IA">Initiation aux outils d'IA (ChatGPT, Gemini, etc.)</option>
                                            <option value="Bureautique (Microsoft 365)">Bureautique complète (Microsoft 365)</option>
                                            <option value="Les Bases de Windows">Les Bases de Windows &amp; Informatique générale</option>
                                            <option value="Les Bases du Design">Les Bases du Design Numérique (Canva, etc.)</option>
                                            <option value="Autre module spécialisé">Autre module spécialisé (sur mesure)</option>
                                        </select>
                                    </div>
                                    <div class="form-text small">Sélectionnez directement le module souhaité dans la liste.</div>
                                </div>
                                <button type="submit" id="moduleReqSubmitBtn" class="btn btn-primary w-100 py-3 fw-bold fs-6 shadow-sm">
                                    <i class="fa fa-paper-plane me-2"></i>Envoyer la demande au responsable
                                </button>
                            </form>
                        </div>
                    </div>
                </div>`;
            document.body.appendChild(modal);
        }

        // Clic sur un bouton "Demander ce module"
        document.addEventListener('click', function (event) {
            var button = event.target.closest('.btn-open-module-modal');
            if (!button) return;
            event.preventDefault();
            event.stopPropagation();
            var moduleName = button.getAttribute('data-module') || 'Module spécialisé';
            
            var selectEl = document.getElementById('moduleReqModuleName');
            if (selectEl) {
                var found = false;
                for (var i = 0; i < selectEl.options.length; i++) {
                    var optVal = selectEl.options[i].value.toLowerCase();
                    var targetVal = moduleName.toLowerCase();
                    if (optVal && (optVal.includes(targetVal) || targetVal.includes(optVal))) {
                        selectEl.selectedIndex = i;
                        found = true;
                        break;
                    }
                }
                if (!found && moduleName) {
                    var newOpt = new Option(moduleName, moduleName, true, true);
                    selectEl.add(newOpt);
                    selectEl.value = moduleName;
                }
            }
            
            var reqModalLabel = document.getElementById('moduleRequestModalLabel');
            if (reqModalLabel) reqModalLabel.textContent = 'Demande du module : ' + moduleName;

            var modalTarget = document.getElementById('moduleRequestModal');
            if (modalTarget) {
                openAnyBootstrapModal(modalTarget);
            }
        });

        // Soumission du formulaire de demande de module
        document.addEventListener('submit', function (event) {
            var form = event.target.closest('#dedicatedModuleRequestForm, #moduleRequestForm');
            if (!form) return;
            event.preventDefault();

            var nomInput = form.querySelector('#moduleReqName, #moduleRequesterName, [name="name"]');
            var emailInput = form.querySelector('#moduleReqEmail, #moduleRequesterEmail, [name="email"]');
            var modInput = form.querySelector('#moduleReqModuleName, #requestedModule, [name="module"]');
            var honeyInput = form.querySelector('[name="website"]');
            var submitBtn = form.querySelector('button[type="submit"]');

            var nom = nomInput ? nomInput.value.trim() : '';
            var email = emailInput ? emailInput.value.trim() : '';
            var moduleName = modInput ? modInput.value.trim() : 'Module spécialisé';
            var honey = honeyInput ? honeyInput.value.trim() : '';

            var successAlert = form.parentNode.querySelector('#moduleReqSuccessAlert, #moduleRequestSuccess');
            var errorAlert = form.parentNode.querySelector('#moduleReqErrorAlert, #moduleRequestError');

            if (successAlert) successAlert.classList.add('d-none');
            if (errorAlert) errorAlert.classList.add('d-none');

            if (!nom || nom.length < 2) {
                if (errorAlert) {
                    errorAlert.textContent = 'Veuillez saisir votre nom complet (au moins 2 caractères).';
                    errorAlert.classList.remove('d-none');
                }
                return;
            }
            if (!email || !email.includes('@')) {
                if (errorAlert) {
                    errorAlert.textContent = 'Veuillez saisir une adresse email valide pour recevoir la réponse de l\'administrateur.';
                    errorAlert.classList.remove('d-none');
                }
                return;
            }
            if (!moduleName) {
                if (errorAlert) {
                    errorAlert.textContent = 'Veuillez préciser le nom du module souhaité.';
                    errorAlert.classList.remove('d-none');
                }
                return;
            }

            var originalText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin me-2"></i>Envoi en cours...';
            }

            var payload = {
                type: 'module_request',
                formation: moduleName,
                name: nom,
                email: email,
                phone: "Non renseigné",
                subject: 'Demande de module : ' + moduleName,
                message: "=== NOUVELLE DEMANDE DE MODULE ===\n\n" +
                         "Nom du demandeur : " + nom + "\n" +
                         "Adresse e-mail : " + email + "\n" +
                         "Module demandé : " + moduleName + "\n" +
                         "Date de la demande : " + new Date().toLocaleString('fr-FR') + "\n\n" +
                         "Cette demande a été transmise depuis le formulaire du site public de la Salle du Numérique.",
                website: honey
            };

            var apiUrl = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
                ? '/api/messages'
                : ((window.API_URL || 'https://backend-eueq.onrender.com') + '/api/messages');

            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(function (res) {
                return res.json().then(function (data) {
                    if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'envoi.');
                    return data;
                });
            })
            .then(function (data) {
                if (data.success) {
                    if (successAlert) {
                        successAlert.innerHTML = '<i class="fa fa-check-circle me-2"></i><strong>Demande envoyée avec succès !</strong> L\'administrateur a bien reçu votre demande pour le module « ' + moduleName + ' » et vous répondra sur <strong>' + email + '</strong>.';
                        successAlert.classList.remove('d-none');
                    }
                    if (nomInput) nomInput.value = '';
                    if (emailInput) emailInput.value = '';
                } else {
                    throw new Error(data.error || 'Impossible d\'enregistrer votre demande.');
                }
            })
            .catch(function (err) {
                if (errorAlert) {
                    errorAlert.textContent = err.message || 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.';
                    errorAlert.classList.remove('d-none');
                }
            })
            .finally(function () {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        });
    }

    function loadContent() {
        // Cache temporaire; les données sauvegardées sur le serveur restent prioritaires.
        var localData = null;
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) localData = JSON.parse(raw);
        } catch (e) {
        }

        // Le contenu sauvegardé par l'admin sur le serveur est la source de vérité,
        // en local comme en production. Le fichier statique sert seulement de secours.
        var isLocal = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1');
        var backendUrl = isLocal ? window.location.origin : (window.API_URL || 'https://backend-eueq.onrender.com');
        var primaryUrl = backendUrl.replace(/\/$/, '') + '/api/content?v=' + Date.now();

        function fetchFallback() {
            fetch('data/content.json?v=' + Date.now())
                .then(function (res) {
                    if (!res.ok) throw new Error('Status ' + res.status);
                    return res.json();
                })
                .then(function (fallbackData) {
                    applySiteContent(fallbackData);
                })
                .catch(function () {
                    if (localData) applySiteContent(localData);
                });
        }

        fetch(primaryUrl)
            .then(function (res) {
                if (!res.ok) throw new Error('Status ' + res.status);
                return res.json();
            })
            .then(function (json) {
                var serverData = (json && json.data) ? json.data : json;
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData)); } catch (e) {}
                applySiteContent(serverData);
            })
            .catch(function () {
                fetchFallback();
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureModuleRequestModal);
    } else {
        ensureModuleRequestModal();
    }

    // Écouter les mises à jour depuis d'autres onglets (ex: onglet Admin vers onglet Utilisateur)
    window.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY && e.newValue) {
            try {
                var updated = JSON.parse(e.newValue);
                applySiteContent(updated);
            } catch (err) {}
        }
    });

    // Délégation d'événement pour le bouton "S'inscrire" des formations dynamiques
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.btn-inscrire');
        if (btn) {
            var formation = btn.getAttribute('data-formation');
            var select = document.getElementById('regFormation');
            if (formation && select) {
                select.value = formation;
            }
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadContent);
    } else {
        loadContent();
    }

    // Exposer globalement pour l'espace admin ou les tests
    window.SNU_CMS = {
        apply: applySiteContent,
        reload: loadContent
    };
})();
