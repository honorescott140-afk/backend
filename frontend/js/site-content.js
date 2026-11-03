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
                            <button class="btn btn-primary w-100 mt-auto py-2 btn-inscrire" data-bs-toggle="modal"
                                data-bs-target="#registrationModal"
                                data-formation="${f.title || ''}">S'inscrire</button>
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
                            <button class="btn btn-primary w-100 mt-auto py-2 btn-inscrire" data-bs-toggle="modal"
                                data-bs-target="#registrationModal" data-formation="${m.title || ''}">S'inscrire</button>
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

        // 8. Témoignages (Ce que pensent nos apprenants)
        if (data.testimonials) {
            var tTitle = document.querySelector('[data-cms="testimonials.main_title"]');
            var tSub = document.querySelector('[data-cms="testimonials.subtitle"]');
            if (tTitle && data.testimonials.main_title) tTitle.innerHTML = data.testimonials.main_title;
            if (tSub && data.testimonials.subtitle) tSub.innerHTML = data.testimonials.subtitle;

            if (data.testimonials.items && data.testimonials.items.length) {
                var testItems = document.querySelectorAll('.testimonial-item');
                data.testimonials.items.forEach(function (t, idx) {
                    var item = testItems[idx];
                    if (!item) return;
                    var img = item.querySelector('img');
                    var h3 = item.querySelector('h3');
                    var p = item.querySelector('p');
                    var h5 = item.querySelector('h5');
                    var span = item.querySelector('span.text-primary') || item.querySelector('.testimonial-text span');
                    if (img && t.img) img.setAttribute('src', t.img);
                    if (h3 && t.title) h3.textContent = t.title;
                    if (p && t.text) p.textContent = t.text;
                    if (h5 && t.name) h5.textContent = t.name;
                    if (span && t.role) span.textContent = t.role;
                });
            }
        }
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

