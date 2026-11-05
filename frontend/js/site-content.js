/**
 * CLAUDIA SNU - Site Content Dynamic Synchronization
 * Permet de synchroniser les textes et images du site public avec les modifications effectuées depuis l'espace Admin.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'snu_site_content';

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
                el.setAttribute('src', val);
            }
        });

        // 3. Liens avec [data-cms-href]
        var linkEls = document.querySelectorAll('[data-cms-href]');
        linkEls.forEach(function (el) {
            var key = el.getAttribute('data-cms-href');
            var val = getNestedValue(data, key);
            if (val) {
                el.setAttribute('href', val);
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
            }
        });

        // 4. Carrousel Hero (si présent)
        if (data.hero && data.hero.slides && data.hero.slides.length) {
            var heroImgs = document.querySelectorAll('.header-carousel img');
            if (heroImgs.length) {
                data.hero.slides.forEach(function (src, idx) {
                    if (heroImgs[idx]) {
                        heroImgs[idx].setAttribute('src', src);
                    }
                });
            }
        }

        // 5. Équipe de gestion (si présente)
        if (data.team && data.team.members && data.team.members.length) {
            var teamCards = document.querySelectorAll('.snu-team-card');
            teamCards.forEach(function (card, idx) {
                var m = data.team.members[idx];
                if (!m) return;
                var img = card.querySelector('img');
                var name = card.querySelector('.snu-name');
                var role = card.querySelector('.snu-role');
                if (img && m.img) img.setAttribute('src', m.img);
                if (name && m.name) name.textContent = m.name;
                if (role && m.role) role.textContent = m.role;
            });
        }

        // 6. Services (dynamique : ajout, modification, suppression)
        if (data.services && data.services.items && data.services.items.length) {
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
                        <div class="service-card p-4 d-flex flex-column align-items-center text-center">
                            <div class="text-center mb-3" style="font-size: 3.5rem; color: var(--accent-blue) !important;">
                                <i class="${s.icon || 'fa fa-desktop'}"></i>
                            </div>
                            <h4 class="mb-3" style="color: #1a1a1a; font-weight: 700;">${s.title || ''}</h4>
                            <p class="mb-0 text-muted" style="font-size: 0.9rem; line-height: 1.6;">${s.desc || ''}</p>
                        </div>
                    `;
                    srvContainer.appendChild(col);
                });
            }
        }

        // 7. Formations Principales (dynamique : ajout, modification, suppression)
        if (data.formations && data.formations.principales && data.formations.principales.length) {
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
        if (data.formations && data.formations.modules && data.formations.modules.length) {
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
        if (data.news && data.news.items && data.news.items.length) {
            var newsContainer = document.getElementById('newsContainer');
            if (newsContainer) {
                newsContainer.innerHTML = '';
                data.news.items.forEach(function (item) {
                    var col = document.createElement('div');
                    col.className = 'col-md-6 col-lg-4';
                    col.innerHTML = `
                        <article class="news-card h-100">
                            <img src="${item.img || 'img/Salle1.jpg'}" alt="${item.title || 'Actualité de la Salle du Numérique'}" class="news-card-img">
                            <div class="p-4">
                                <div class="small text-danger fw-bold mb-2">${item.category || 'Actualité'} · ${item.date || ''}</div>
                                <h3 class="h5">${item.title || ''}</h3>
                                <p class="text-muted mb-0">${item.excerpt || ''}</p>
                            </div>
                        </article>`;
                    newsContainer.appendChild(col);
                });
            }
        }

        // 8b. Équipe de la Salle du Numérique
        if (data.team && data.team.members && data.team.members.length) {
            var teamContainer = document.getElementById('teamContainer') || document.querySelector('.snu-team-section .row');
            if (teamContainer) {
                teamContainer.innerHTML = '';
                data.team.members.forEach(function (m) {
                    var col = document.createElement('div');
                    col.className = 'col-sm-6 col-lg-4';
                    col.innerHTML = `
                        <article class="snu-team-card h-100">
                            <div class="snu-img-wrap"><img src="${m.img || 'img/Logo_SNU.jpg'}" alt="${m.name || 'Membre de l\'équipe'}, ${m.role || 'Fonction'}"></div>
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

            if (data.testimonials.items && data.testimonials.items.length) {
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
                                        <img class="img-fluid" src="${t.img || 'img/testimonial-1.jpeg'}" alt="${t.name || ''}">
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

    // Le module possède un parcours distinct : il recueille le niveau et
    // l'objectif précis du demandeur, au lieu de réutiliser l'inscription générale.
    function ensureModuleRequestModal() {
        if (document.getElementById('moduleRequestModal')) return;
        var modal = document.createElement('div');
        modal.id = 'moduleRequestModal';
        modal.className = 'modal fade module-request-modal';
        modal.tabIndex = -1;
        modal.setAttribute('aria-labelledby', 'moduleRequestModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content shadow-lg border-0">
                    <div class="modal-header py-3 px-4 text-white" style="background:#8f0000;">
                        <div class="d-flex align-items-center">
                            <i class="fa fa-file-signature fs-2 me-3"></i>
                            <div>
                                <h5 class="modal-title fw-bold text-white mb-0" id="moduleRequestModalLabel">Demande de module</h5>
                                <small class="text-white-50">Formulaire spécifique — Salle du Numérique UNILU</small>
                            </div>
                        </div>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body p-4 p-md-5">
                        <div id="moduleRequestSuccess" class="alert alert-success d-none" role="alert"></div>
                        <div id="moduleRequestError" class="alert alert-danger d-none" role="alert"></div>
                        <form id="moduleRequestForm" novalidate>
                            <input type="text" name="website" style="display:none !important" tabindex="-1" autocomplete="off">
                            <input type="hidden" id="requestedModule" name="module">
                            <div class="mb-3">
                                <label class="form-label fw-bold" for="requestedModuleDisplay">Module demandé</label>
                                <input class="form-control" id="requestedModuleDisplay" readonly>
                            </div>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold" for="moduleRequesterName">Nom complet <span class="text-danger">*</span></label>
                                    <input class="form-control" id="moduleRequesterName" name="name" required minlength="2" placeholder="Nom et prénom">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold" for="moduleRequesterPhone">Téléphone / WhatsApp <span class="text-danger">*</span></label>
                                    <input class="form-control" id="moduleRequesterPhone" name="phone" required minlength="7" placeholder="+243 ...">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold" for="moduleRequesterEmail">Email <span class="text-danger">*</span></label>
                                    <input type="email" class="form-control" id="moduleRequesterEmail" name="email" required placeholder="nom@exemple.com">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold" for="moduleRequesterLevel">Niveau actuel</label>
                                    <select class="form-select" id="moduleRequesterLevel" name="level">
                                        <option>Débutant</option><option>Intermédiaire</option><option>Avancé</option>
                                    </select>
                                </div>
                                <div class="col-12">
                                    <label class="form-label fw-bold" for="moduleRequesterGoal">Objectif ou besoin principal <span class="text-danger">*</span></label>
                                    <textarea class="form-control" id="moduleRequesterGoal" name="goal" rows="3" required minlength="10" placeholder="Expliquez ce que vous souhaitez apprendre ou réaliser..."></textarea>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold" for="moduleRequesterAvailability">Disponibilité préférée</label>
                                    <select class="form-select" id="moduleRequesterAvailability" name="availability">
                                        <option>Matinée</option><option>Après-midi</option><option>Soirée</option><option>Samedi</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold" for="moduleRequesterFaculty">Faculté / Promotion</label>
                                    <input class="form-control" id="moduleRequesterFaculty" name="faculty" placeholder="Ex : Droit, L2">
                                </div>
                            </div>
                            <button type="submit" id="moduleRequestSubmit" class="btn btn-primary w-100 py-3 mt-4 fw-bold">
                                <i class="fa fa-paper-plane me-2"></i>Envoyer la demande de module
                            </button>
                        </form>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);

        // Bootstrap est normalement chargé avant ce fichier. Le repli manuel
        // garde le formulaire utilisable si un CDN ou un bundle est indisponible.
        function openModuleModal() {
            if (window.bootstrap && window.bootstrap.Modal) {
                window.bootstrap.Modal.getOrCreateInstance(modal).show();
                return;
            }
            modal.classList.add('show');
            modal.style.display = 'block';
            modal.removeAttribute('aria-hidden');
            document.body.classList.add('modal-open');
        }

        function closeModuleModal() {
            if (window.bootstrap && window.bootstrap.Modal) {
                var instance = window.bootstrap.Modal.getInstance(modal);
                if (instance) instance.hide();
                return;
            }
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
        }

        document.addEventListener('click', function (event) {
            var button = event.target.closest('.btn-open-module-modal');
            if (!button) return;
            var moduleName = button.getAttribute('data-module') || 'Module spécialisé';
            document.getElementById('requestedModule').value = moduleName;
            document.getElementById('requestedModuleDisplay').value = moduleName;
            document.getElementById('moduleRequestModalLabel').textContent = 'Demande du module : ' + moduleName;
            openModuleModal();
        });

        modal.querySelectorAll('[data-bs-dismiss="modal"]').forEach(function (closeButton) {
            closeButton.addEventListener('click', closeModuleModal);
        });

        document.getElementById('moduleRequestForm').addEventListener('submit', function (event) {
            event.preventDefault();
            var form = event.currentTarget;
            if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
            var submit = document.getElementById('moduleRequestSubmit');
            var original = submit.innerHTML;
            var name = document.getElementById('moduleRequesterName').value.trim();
            var phone = document.getElementById('moduleRequesterPhone').value.trim();
            var email = document.getElementById('moduleRequesterEmail').value.trim();
            var moduleName = document.getElementById('requestedModule').value;
            var level = document.getElementById('moduleRequesterLevel').value;
            var goal = document.getElementById('moduleRequesterGoal').value.trim();
            var availability = document.getElementById('moduleRequesterAvailability').value;
            var faculty = document.getElementById('moduleRequesterFaculty').value.trim() || 'Non précisée';
            var payload = {
                name: name, phone: phone, email: email,
                subject: 'Demande de module : ' + moduleName,
                message: "=== DEMANDE DE MODULE ===\nModule : " + moduleName + "\nNom : " + name + "\nTéléphone : " + phone + "\nEmail : " + email + "\nNiveau : " + level + "\nObjectif : " + goal + "\nDisponibilité : " + availability + "\nFaculté / Promotion : " + faculty,
                website: form.querySelector('input[name="website"]').value || ''
            };
            submit.disabled = true;
            submit.innerHTML = '<i class="fa fa-spinner fa-spin me-2"></i>Transmission...';
            document.getElementById('moduleRequestSuccess').classList.add('d-none');
            document.getElementById('moduleRequestError').classList.add('d-none');
            fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                .then(function (response) {
                    return response.text().then(function (text) {
                        var data;
                        try { data = JSON.parse(text); } catch (parseError) {
                            throw new Error('Le serveur ne répond pas avec un résultat JSON. Vérifiez que le serveur SNU est démarré.');
                        }
                        if (!response.ok) throw new Error(data.error || 'Le serveur a refusé la demande.');
                        return data;
                    });
                })
                .then(function (data) {
                    if (!data.success) throw new Error(data.error || 'Erreur de transmission.');
                    document.getElementById('moduleRequestSuccess').innerHTML = '<i class="fa fa-check-circle me-2"></i><strong>Demande envoyée.</strong> Notre équipe vous contactera pour confirmer le module et le prochain créneau.';
                    document.getElementById('moduleRequestSuccess').classList.remove('d-none');
                    form.reset();
                    document.getElementById('requestedModuleDisplay').value = moduleName;
                    document.getElementById('requestedModule').value = moduleName;
                })
                .catch(function (error) {
                    document.getElementById('moduleRequestError').textContent = error.message || 'Erreur de transmission.';
                    document.getElementById('moduleRequestError').classList.remove('d-none');
                })
                .finally(function () { submit.disabled = false; submit.innerHTML = original; });
        });
    }

    function loadContent() {
        // Priorité 1 : modifications locales dans le navigateur
        var localData = null;
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) localData = JSON.parse(raw);
        } catch (e) {
        }

        if (localData) {
            applySiteContent(localData);
        }

        // Priorité 2 : fichier data/content.json sur le serveur
        fetch('data/content.json?v=' + new Date().getTime())
            .then(function (res) {
                if (!res.ok) throw new Error('Status ' + res.status);
                return res.json();
            })
            .then(function (serverData) {
                // Si aucune modification locale, utiliser les données du serveur
                if (!localData) {
                    applySiteContent(serverData);
                } else {
                    // Si localData existe, on l'applique mais on s'assure que les nouveaux champs serveur sont pris en compte
                    var merged = Object.assign({}, serverData, localData);
                    applySiteContent(merged);
                }
            })
            .catch(function (err) {
                // Si content.json n'est pas dispo (ex: CORS file://), localData fait l'affaire
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
