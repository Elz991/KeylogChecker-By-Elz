document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // PWA SERVICE WORKER & SHORTCUT INSTALL HANDLER
    // ==========================================
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").catch(() => {});
    }

    let deferredPrompt = null;
    const installAppBtn = document.getElementById("installAppBtn");
    const installGuideModal = document.getElementById("installGuideModal");
    const closeInstallModalBtn = document.getElementById("closeInstallModalBtn");
    const okInstallModalBtn = document.getElementById("okInstallModalBtn");

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });

    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        if (installAppBtn) installAppBtn.classList.add("hidden");
    });

    if (installAppBtn) {
        installAppBtn.addEventListener("click", async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const choiceResult = await deferredPrompt.userChoice;
                if (choiceResult.outcome === "accepted") {
                    deferredPrompt = null;
                }
            } else {
                installGuideModal.classList.remove("hidden");
            }
        });
    }

    if (closeInstallModalBtn) {
        closeInstallModalBtn.addEventListener("click", () => {
            installGuideModal.classList.add("hidden");
        });
    }

    if (okInstallModalBtn) {
        okInstallModalBtn.addEventListener("click", () => {
            installGuideModal.classList.add("hidden");
        });
    }

    // ==========================================
    // UNIQUE DEVICE VISITOR TRACKING (1 HP = 1 VIEW)
    // ==========================================
    const COUNTER_KEY = "keylogger_checking_elz_unique_devices_v1";
    const LOCAL_FALLBACK_KEY = "elz_local_visitor_total";
    const DEVICE_MARK_KEY = "elz_unique_device_counted_v1";
    let globalVisitorCount = parseInt(localStorage.getItem(LOCAL_FALLBACK_KEY) || "0", 10);

    function hasDeviceBeenCounted() {
        // Cek di localStorage
        if (localStorage.getItem(DEVICE_MARK_KEY) === "true") {
            return true;
        }
        // Cek cadangan di Cookie (bertahan 10 tahun)
        if (document.cookie.split(";").some(item => item.trim().startsWith(`${DEVICE_MARK_KEY}=true`))) {
            localStorage.setItem(DEVICE_MARK_KEY, "true");
            return true;
        }
        return false;
    }

    function markDeviceAsCounted() {
        localStorage.setItem(DEVICE_MARK_KEY, "true");
        // Simpan cookie permanen (10 tahun) sebagai cadangan jika cache browser dibersihkan sebagian
        const maxAge = 60 * 60 * 24 * 365 * 10;
        document.cookie = `${DEVICE_MARK_KEY}=true; path=/; max-age=${maxAge}; SameSite=Lax`;
    }

    async function trackAndFetchVisitors(isInitialPageLoad = false) {
        const alreadyCounted = hasDeviceBeenCounted();
        const shouldIncrement = isInitialPageLoad && !alreadyCounted;

        try {
            const endpoint = shouldIncrement
                ? `https://api.counterapi.dev/v1/elz99-samp/${COUNTER_KEY}/up`
                : `https://api.counterapi.dev/v1/elz99-samp/${COUNTER_KEY}`;
            const res = await fetch(endpoint);
            if (res.ok) {
                const data = await res.json();
                if (typeof data.count === "number") {
                    globalVisitorCount = data.count;
                    localStorage.setItem(LOCAL_FALLBACK_KEY, String(globalVisitorCount));
                    if (shouldIncrement) {
                        markDeviceAsCounted();
                    }
                    updateSecretCounterDisplay();
                    return;
                }
            }
        } catch (err) {
            // Fallback lokal saat offline
        }

        if (shouldIncrement) {
            globalVisitorCount += 1;
            localStorage.setItem(LOCAL_FALLBACK_KEY, String(globalVisitorCount));
            markDeviceAsCounted();
        }
        updateSecretCounterDisplay();
    }

    function updateSecretCounterDisplay() {
        const countEl = document.getElementById("secretTotalViews");
        if (countEl) {
            countEl.textContent = globalVisitorCount.toLocaleString("id-ID");
        }
    }

    // Jalankan pengecekan 1 HP = 1 View saat halaman pertama kali dimuat
    trackAndFetchVisitors(true);

    // ==========================================
    // DICTIONARY BAHASA (INDONESIA & ENGLISH)
    // ==========================================
    let currentLang = "id";

    const I18N = {
        id: {
            nav_back: "BERANDA",
            btn_install: "INSTALL APP",
            install_modal_title: "PASANG KE LAYAR PONSEL",
            install_modal_desc: "Tekan ikon <strong>titik tiga (⋮)</strong> di pojok kanan atas browser Chrome Anda, lalu pilih menu <strong>\"Tambahkan ke layar utama\"</strong> atau <strong>\"Install aplikasi\"</strong> untuk memasang pintasan <strong>KEYLOGGER CHECKING</strong> dengan ikon <code>ikon.png</code>.",
            install_btn_ok: "MENGERTI",
            hero_badge: "SAMP MOBILE SECURITY SYSTEM",
            hero_desc: "Sistem pemindai forensik statis & bytecode tingkat lanjut untuk melindungi akun SA-MP Mobile Anda dari script pencuri password, webhook stealer, dan malware tersembunyi.",
            menu1_tag: "CORE ENGINE v3.5",
            menu1_title: "Check File Samp",
            menu1_desc: "Analisis mendalam file MonetLoader (.lua / .luac) dan CLEO Mobile (.cs / .csa / .csi) secara lokal & instan.",
            menu2_tag: "USER TUTORIAL & STEPS",
            menu2_title: "Panduan Keylogger Check File",
            menu2_desc: "Tutorial lengkap langkah demi langkah cara menggunakan fitur Check File Samp beserta panduan gambar.",
            menu_wiki_tag: "CYBERSECURITY EDUCATION",
            menu_wiki_title: "Pengertian Keylogger",
            menu_wiki_desc: "Pelajari apa itu keylogger, bagaimana cara kerjanya mencuri akun SAMP, serta cara mencegahnya.",
            menu3_tag: "DONASI & KONTRIBUSI",
            menu3_title: "Support Devloper",
            menu3_desc: "Dukung Elz untuk terus mengembangkan database deteksi keylogger terbaru dan pembaruan fitur gratis.",
            stat1_lbl: "Analisis Lokal Aman",
            stat2_lbl: "Support Bytecode",
            stat3_lbl: "Deteksi Webhook",
            check_page_title: "CHECK FILE SAMP",
            check_page_sub: "MonetLoader & CLEO Mobile Forensics",
            drop_title: "Pilih atau Tarik File Script SAMP",
            drop_desc: "Hanya mendukung file mentah: <strong>.lua / .luac</strong> (MonetLoader) & <strong>.cs / .csa / .csi</strong> (CLEO)",
            btn_select: "PILIH FILE SCRIPT",
            verdict_label: "HASIL ANALISIS KEAMANAN",
            metric_net: "Koneksi Jaringan",
            metric_hook: "Hook Dialog / Input",
            metric_obf: "Obfuscation / Encrypt",
            metric_threat: "Total Ancaman",
            findings_header: "RINCIAN TEMUAN & LOG FORENSIK",
            strings_header: "URL / WEBHOOK / STRING MENCURIGAKAN TERDETEKSI",
            modal_title: "PENTING!! WAJIB DIBACA SEBELUM MENGGUNAKAN...",
            modal_highlight: "File yang di cek wajib berformat <strong>(.lua/.luac)</strong> Untuk Monetloader Dan <strong>(.Cs/.Csa/.Csi)</strong> Untuk Cleo). Tidak boleh menggunakan format <strong>(.Zip/7z.Raw/ dan lain lain)</strong>.",
            modal_rule1: "<strong>Ekstrak File Terlebih Dahulu:</strong> Jika mod atau script yang Anda download masih terbungkus arsip (<code>.zip</code>, <code>.rar</code>, <code>.7z</code>), ekstrak terlebih dahulu menggunakan ZArchiver lalu unggah satu per satu file script aslinya.",
            modal_rule2: "<strong>Cek Seluruh File Pendukung:</strong> Pelaku keylogger sering menyisipkan pencuri akun di file library tambahan (misalnya file <code>.lua</code> kecil di dalam folder <code>lib</code>), bukan hanya di script utamanya.",
            modal_rule3: "<strong>100% Privasi Terjaga:</strong> Proses pemindaian berjalan langsung di perangkat Anda tanpa mengunggah file ke server mana pun.",
            modal_footer: "Tekan tombol <strong>\"X\"</strong> di pojok kanan atas untuk menutup pesan ini dan membuka alat pemindai.",
            guide_page_title: "PANDUAN KEYLOGGER CHECK FILE",
            guide_page_sub: "Cara Menggunakan Fitur Pemindai Script SAMP Dengan Benar",
            guide_step1_desc: "Tekan menu Check File samp pada halaman utama.",
            guide_step2_desc: "Tekan Tombol ❌ Setelah membaca peraturan tentang format file.",
            guide_step3_desc: "Tekan Pilih file Script.",
            guide_step4_desc: "Jika muncul tulisan hijau yang menyatakan file tersebut aman, Berarti file tersebut dinyatakan aman dan tanpa keylogger.",
            guide_step5_desc: "Jika muncul tulisan merah atau kuning yang menyatakan file tersebut berbahaya maka file tersebut mengandung keylogger dan dilarang keras untuk digunakan.",
            wiki_page_title: "PENGERTIAN KEYLOGGER",
            wiki_page_sub: "Edukasi Keamanan Akun SA-MP Mobile",
            wiki_h1: "Apa Itu Keylogger?",
            wiki_p1: "<strong>Keylogger (Keystroke Logger)</strong> adalah program atau potongan kode berbahaya yang dirancang untuk merekam, menyadap, dan mencuri setiap ketikan tombol maupun input teks yang dimasukkan pengguna pada perangkat mereka secara diam-diam tanpa sepengetahuan korban.",
            wiki_h2: "Bagaimana Cara Kerja Keylogger di SA-MP Mobile?",
            wiki_p2: "Pada ekosistem <strong>GTA SA-MP Android</strong> (seperti <strong>MonetLoader</strong> berformat <code>.lua / .luac</code> maupun <strong>CLEO Mobile</strong> berformat <code>.cs / .csa / .csi</code>), pelaku kejahatan biasanya menyamarkan keylogger di dalam mod gratis seperti mod grafik, mod senjata, mod kendaraan, atau script pembantu gameplay.",
            wiki_p3: "Saat pemain masuk ke dalam server dan mengetikkan <strong>Password Akun</strong> atau <strong>PIN Keamanan</strong> melalui kotak dialog login maupun perintah chat (<code>/login</code>, <code>/register</code>), script keylogger akan menangkap teks tersebut beserta <em>Nickname</em> dan <em>IP Server</em>, lalu mengirimkannya secara otomatis ke server pelaku melalui <strong>Discord Webhook</strong> atau <strong>Bot Telegram</strong>.",
            wiki_h3: "Dampak & Bahaya Bagi Pemain",
            wiki_li1: "<strong>Pencurian Akun Permanen:</strong> Pelaku dapat langsung masuk ke akun karakter Anda, mengganti password, dan menguras seluruh harta, kendaraan, maupun properti di dalam game.",
            wiki_li2: "<strong>Penyalahgunaan Karakter (Banned):</strong> Akun yang dicuri sering dipakai untuk melakukan pelanggaran berat (cheat/RTM) sehingga akun asli Anda terkena sanksi <em>Banned Permanen</em> oleh admin server.",
            wiki_li3: "<strong>Kebocoran Password Utama:</strong> Jika Anda menggunakan password yang sama untuk akun SAMP dan email/media sosial, pelaku berpotensi meretas akun pribadi Anda lainnya.",
            wiki_h4: "Tips Mencegah Terkena Keylogger",
            wiki_p4: "Selalu periksa setiap file <code>.lua</code>, <code>.luac</code>, <code>.cs</code>, <code>.csa</code>, dan <code>.csi</code> menggunakan fitur <strong>Check File Samp</strong> sebelum memasangnya ke folder game, hindari mengunduh mod dari sumber tidak jelas, serta gunakan password yang unik untuk setiap server SA-MP.",
            sup_page_title: "SUPPORT DEVLOPER",
            sup_page_sub: "Dukung Pengembangan Tools SAMP Security",
            sup_role: "Creator & Security Tool Developer",
            sup_bio: "Terima kasih telah menggunakan <strong>KEYLOGGER CHECKING</strong>. Tools ini dibuat gratis untuk membantu komunitas pemain SA-MP Mobile terhindar dari pencurian akun. Dukungan Anda sangat berarti untuk biaya riset signature keylogger baru dan pemeliharaan sistem.",
            sup_link_label: "OFFICIAL DONATION LINK",
            btn_copy: "SALIN",
            btn_copied: "TERSALIN!",
            sup_btn_saweria: "DUKUNG VIA SAWERIA.CO/ELZ99",
            perk1_title: "Update Signature Rutin",
            perk1_desc: "Penambahan pola deteksi metode obfuscation dan webhook stealer terbaru.",
            perk2_title: "100% Gratis Tanpa Iklan Mengganggu",
            perk2_desc: "Akses penuh untuk seluruh pemain SAMP Android tanpa batasan jumlah scan.",
            secret_modal_title: "MASUKAN PASSWORD",
            secret_wrong_pass: "Password salah!",
            secret_btn_unlock: "BUKA AKSES"
        },
        en: {
            nav_back: "HOME",
            btn_install: "INSTALL APP",
            install_modal_title: "ADD TO HOME SCREEN",
            install_modal_desc: "Tap the <strong>three dots (⋮)</strong> icon at the top right corner of your Chrome browser, then choose <strong>\"Add to Home screen\"</strong> or <strong>\"Install app\"</strong> to install the <strong>KEYLOGGER CHECKING</strong> shortcut with <code>ikon.png</code>.",
            install_btn_ok: "GOT IT",
            hero_badge: "SAMP MOBILE SECURITY SYSTEM",
            hero_desc: "Advanced static & bytecode forensic scanner to protect your SA-MP Mobile account from password stealers, webhook loggers, and hidden malware.",
            menu1_tag: "CORE ENGINE v3.5",
            menu1_title: "Check Samp File",
            menu1_desc: "Deep local & instant analysis for MonetLoader (.lua / .luac) and CLEO Mobile (.cs / .csa / .csi) scripts.",
            menu2_tag: "USER TUTORIAL & STEPS",
            menu2_title: "Keylogger Check File Guide",
            menu2_desc: "Complete step-by-step tutorial on how to use the Check Samp File feature with visual photo slots.",
            menu_wiki_tag: "CYBERSECURITY EDUCATION",
            menu_wiki_title: "What is a Keylogger",
            menu_wiki_desc: "Learn what a keylogger is, how it steals SAMP accounts, and how to protect yourself.",
            menu3_tag: "DONATION & CONTRIBUTION",
            menu3_title: "Support Developer",
            menu3_desc: "Support Elz to keep updating the latest keylogger detection signatures and free security features.",
            stat1_lbl: "100% Local Safe Scan",
            stat2_lbl: "Bytecode Support",
            stat3_lbl: "Webhook Detection",
            check_page_title: "CHECK SAMP FILE",
            check_page_sub: "MonetLoader & CLEO Mobile Forensics",
            drop_title: "Select or Drop SAMP Script File",
            drop_desc: "Only raw script files supported: <strong>.lua / .luac</strong> (MonetLoader) & <strong>.cs / .csa / .csi</strong> (CLEO)",
            btn_select: "SELECT SCRIPT FILE",
            verdict_label: "SECURITY ANALYSIS VERDICT",
            metric_net: "Network Connection",
            metric_hook: "Dialog / Input Hook",
            metric_obf: "Obfuscation / Encrypt",
            metric_threat: "Total Threats",
            findings_header: "FORENSIC FINDINGS & DETECTION LOG",
            strings_header: "SUSPICIOUS URLS / WEBHOOKS / STRINGS DETECTED",
            modal_title: "IMPORTANT!! MUST READ BEFORE USING...",
            modal_highlight: "Checked files must be in <strong>(.lua/.luac)</strong> format for MonetLoader and <strong>(.Cs/.Csa/.Csi)</strong> for CLEO. Archive formats such as <strong>(.Zip/.7z/.Rar/ etc.)</strong> are strictly prohibited.",
            modal_rule1: "<strong>Extract Files First:</strong> If the mod or script you downloaded is still inside an archive (<code>.zip</code>, <code>.rar</code>, <code>.7z</code>), extract it first using ZArchiver and upload the raw script files one by one.",
            modal_rule2: "<strong>Check All Supporting Libraries:</strong> Keylogger makers often hide account stealers inside small library files (e.g., <code>.lua</code> files inside the <code>lib</code> folder), not just the main script.",
            modal_rule3: "<strong>100% Privacy Guaranteed:</strong> All scanning runs locally on your device without uploading files to any external server.",
            modal_footer: "Press the <strong>\"X\"</strong> button at the top right corner to close this notice and unlock the scanner.",
            guide_page_title: "KEYLOGGER CHECK FILE GUIDE",
            guide_page_sub: "How to Properly Use the SAMP Script Scanner",
            guide_step1_desc: "Press the Check File Samp menu on the main home page.",
            guide_step2_desc: "Press the ❌ button after reading the file format rules.",
            guide_step3_desc: "Press Select Script File.",
            guide_step4_desc: "If green text appears stating the file is safe, it means the file is verified clean and free of keyloggers.",
            guide_step5_desc: "If red or yellow text appears stating the file is dangerous, then the file contains a keylogger and is strictly prohibited from use.",
            wiki_page_title: "WHAT IS A KEYLOGGER",
            wiki_page_sub: "SA-MP Mobile Account Security Education",
            wiki_h1: "What is a Keylogger?",
            wiki_p1: "A <strong>Keylogger (Keystroke Logger)</strong> is a malicious program or piece of code designed to secretly record, intercept, and steal every keystroke and text input typed by users on their devices without their knowledge.",
            wiki_h2: "How Do Keyloggers Work in SA-MP Mobile?",
            wiki_p2: "In the <strong>GTA SA-MP Android</strong> ecosystem (such as <strong>MonetLoader</strong> <code>.lua / .luac</code> scripts and <strong>CLEO Mobile</strong> <code>.cs / .csa / .csi</code> files), attackers disguise keyloggers inside free mods like graphics mods, weapon packs, vehicle mods, or gameplay helpers.",
            wiki_p3: "When a player joins a server and enters their <strong>Account Password</strong> or <strong>Security PIN</strong> via login dialogs or chat commands (<code>/login</code>, <code>/register</code>), the keylogger captures the credentials along with their <em>Nickname</em> and <em>Server IP</em>, sending them automatically to the attacker via a <strong>Discord Webhook</strong> or <strong>Telegram Bot</strong>.",
            wiki_h3: "Risks & Impact on Players",
            wiki_li1: "<strong>Permanent Account Theft:</strong> Attackers can immediately log into your character, change the password, and steal all in-game money, vehicles, and properties.",
            wiki_li2: "<strong>Account Ban Abuse:</strong> Stolen accounts are frequently used to break server rules (cheating/RMT), resulting in your account getting <em>Permanently Banned</em>.",
            wiki_li3: "<strong>Personal Account Compromise:</strong> Reusing the same password across SAMP and your email or social media puts your personal accounts at risk.",
            wiki_h4: "How to Prevent Keylogger Attacks",
            wiki_p4: "Always scan every <code>.lua</code>, <code>.luac</code>, <code>.cs</code>, <code>.csa</code>, and <code>.csi</code> file using <strong>Check File Samp</strong> before placing it in your game folder, avoid untrusted mod links, and use unique passwords for every SA-MP server.",
            sup_page_title: "SUPPORT DEVELOPER",
            sup_page_sub: "Support SAMP Security Tools Development",
            sup_role: "Creator & Security Tool Developer",
            sup_bio: "Thank you for using <strong>KEYLOGGER CHECKING</strong>. This tool is built for free to protect SA-MP Mobile players from account theft. Your support helps fund new keylogger signature research and system maintenance.",
            sup_link_label: "OFFICIAL DONATION LINK",
            btn_copy: "COPY",
            btn_copied: "COPIED!",
            sup_btn_saweria: "SUPPORT VIA SAWERIA.CO/ELZ99",
            perk1_title: "Regular Signature Updates",
            perk1_desc: "Continuous detection updates for new obfuscators and webhook stealer techniques.",
            perk2_title: "100% Free & Ad-Free Experience",
            perk2_desc: "Unlimited access for all SAMP Android players with zero scan limits.",
            secret_modal_title: "ENTER PASSWORD",
            secret_wrong_pass: "Incorrect password!",
            secret_btn_unlock: "UNLOCK ACCESS"
        }
    };

    const btnLangID = document.getElementById("btnLangID");
    const btnLangEN = document.getElementById("btnLangEN");

    function applyLanguage(lang) {
        currentLang = lang;
        btnLangID.classList.toggle("active", lang === "id");
        btnLangEN.classList.toggle("active", lang === "en");

        const dict = I18N[lang];
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) {
                el.innerHTML = dict[key];
            }
        });
    }

    btnLangID.addEventListener("click", () => applyLanguage("id"));
    btnLangEN.addEventListener("click", () => applyLanguage("en"));

    // ==========================================
    // NAVIGATION ELEMENTS (6 HALAMAN)
    // ==========================================
    const backHomeBtn = document.getElementById("backHomeBtn");
    const homeBgLayer = document.getElementById("homeBgLayer");

    const pageHome = document.getElementById("pageHome");
    const pageCheck = document.getElementById("pageCheck");
    const pageGuide = document.getElementById("pageGuide");
    const pageWiki = document.getElementById("pageWiki");
    const pageSupport = document.getElementById("pageSupport");
    const pageSecret = document.getElementById("pageSecret");

    const btnGoCheck = document.getElementById("btnGoCheck");
    const btnGoGuide = document.getElementById("btnGoGuide");
    const btnGoWiki = document.getElementById("btnGoWiki");
    const btnGoSupport = document.getElementById("btnGoSupport");

    const warningModal = document.getElementById("warningModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const scannerWorkspace = document.getElementById("scannerWorkspace");

    let secretRefreshTimer = null;

    function switchPage(target) {
        pageHome.classList.add("hidden");
        pageCheck.classList.add("hidden");
        pageGuide.classList.add("hidden");
        pageWiki.classList.add("hidden");
        pageSupport.classList.add("hidden");
        pageSecret.classList.add("hidden");

        if (secretRefreshTimer) {
            clearInterval(secretRefreshTimer);
            secretRefreshTimer = null;
        }

        if (target === "home") {
            backHomeBtn.classList.add("hidden");
            pageHome.classList.remove("hidden");
            homeBgLayer.classList.remove("hidden");
        } else if (target === "check") {
            backHomeBtn.classList.remove("hidden");
            pageCheck.classList.remove("hidden");
            homeBgLayer.classList.add("hidden");
            scannerWorkspace.classList.add("locked-blur");
            warningModal.classList.remove("hidden");
        } else if (target === "guide") {
            backHomeBtn.classList.remove("hidden");
            pageGuide.classList.remove("hidden");
            homeBgLayer.classList.add("hidden");
        } else if (target === "wiki") {
            backHomeBtn.classList.remove("hidden");
            pageWiki.classList.remove("hidden");
            homeBgLayer.classList.add("hidden");
        } else if (target === "support") {
            backHomeBtn.classList.remove("hidden");
            pageSupport.classList.remove("hidden");
            homeBgLayer.classList.add("hidden");
        } else if (target === "secret") {
            backHomeBtn.classList.remove("hidden");
            pageSecret.classList.remove("hidden");
            homeBgLayer.classList.add("hidden");
            trackAndFetchVisitors(false);
            secretRefreshTimer = setInterval(() => trackAndFetchVisitors(false), 5000);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    btnGoCheck.addEventListener("click", () => switchPage("check"));
    btnGoGuide.addEventListener("click", () => switchPage("guide"));
    btnGoWiki.addEventListener("click", () => switchPage("wiki"));
    btnGoSupport.addEventListener("click", () => switchPage("support"));
    backHomeBtn.addEventListener("click", () => switchPage("home"));

    closeModalBtn.addEventListener("click", () => {
        warningModal.classList.add("hidden");
        scannerWorkspace.classList.remove("locked-blur");
    });

    // ==========================================
    // TOMBOL RAHASIA (TEKAN 20x) & POP-UP PASSWORD
    // ==========================================
    const secretBadgeTrigger = document.getElementById("secretBadgeTrigger");
    const secretPasswordModal = document.getElementById("secretPasswordModal");
    const closeSecretModalBtn = document.getElementById("closeSecretModalBtn");
    const secretPasswordInput = document.getElementById("secretPasswordInput");
    const submitSecretPassBtn = document.getElementById("submitSecretPassBtn");
    const secretErrorMsg = document.getElementById("secretErrorMsg");

    let secretTapCount = 0;
    let secretTapResetTimer = null;

    secretBadgeTrigger.addEventListener("click", () => {
        secretTapCount += 1;
        clearTimeout(secretTapResetTimer);
        secretTapResetTimer = setTimeout(() => {
            secretTapCount = 0;
        }, 2500);

        if (secretTapCount >= 20) {
            secretTapCount = 0;
            secretPasswordInput.value = "";
            secretErrorMsg.classList.add("hidden");
            secretPasswordModal.classList.remove("hidden");
            setTimeout(() => secretPasswordInput.focus(), 100);
        }
    });

    function verifySecretPassword() {
        const entered = secretPasswordInput.value.trim();
        if (entered === "fujima33101") {
            secretPasswordModal.classList.add("hidden");
            secretErrorMsg.classList.add("hidden");
            switchPage("secret");
        } else {
            secretErrorMsg.classList.remove("hidden");
            secretPasswordInput.value = "";
            secretPasswordInput.focus();
        }
    }

    submitSecretPassBtn.addEventListener("click", verifySecretPassword);
    secretPasswordInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") verifySecretPassword();
    });

    closeSecretModalBtn.addEventListener("click", () => {
        secretPasswordModal.classList.add("hidden");
        secretErrorMsg.classList.add("hidden");
    });

    // ==========================================
    // COPY LINK SAWERIA
    // ==========================================
    const copySaweriaBtn = document.getElementById("copySaweriaBtn");
    copySaweriaBtn.addEventListener("click", () => {
        const link = "https://saweria.co/Elz99";
        if (navigator.clipboard) navigator.clipboard.writeText(link);
        copySaweriaBtn.textContent = I18N[currentLang].btn_copied;
        setTimeout(() => {
            copySaweriaBtn.textContent = I18N[currentLang].btn_copy;
        }, 1800);
    });

    // ==========================================
    // FILE UPLOAD & KEYLOGGER SCANNER ENGINE
    // ==========================================
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const selectBtn = document.getElementById("selectBtn");
    const scanProcess = document.getElementById("scanProcess");
    const resetBtn = document.getElementById("resetBtn");

    const fileNameEl = document.getElementById("fileName");
    const fileSizeEl = document.getElementById("fileSize");
    const scanStatusText = document.getElementById("scanStatusText");
    const scanPercent = document.getElementById("scanPercent");
    const progressFill = document.getElementById("progressFill");

    const resultSection = document.getElementById("resultSection");
    const verdictCard = document.getElementById("verdictCard");
    const verdictIcon = document.getElementById("verdictIcon");
    const verdictTitle = document.getElementById("verdictTitle");
    const verdictSummary = document.getElementById("verdictSummary");
    const riskScoreEl = document.getElementById("riskScore");

    const metricNetwork = document.getElementById("metricNetwork");
    const metricHook = document.getElementById("metricHook");
    const metricObf = document.getElementById("metricObf");
    const metricThreats = document.getElementById("metricThreats");

    const hashDisplay = document.getElementById("hashDisplay");
    const findingsList = document.getElementById("findingsList");
    const stringsCard = document.getElementById("stringsCard");
    const extractedStrings = document.getElementById("extractedStrings");

    const ALLOWED_EXTENSIONS = ["lua", "luac", "cs", "csa", "csi"];

    selectBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    dropZone.addEventListener("click", () => fileInput.click());

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) validateAndProcessFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) validateAndProcessFile(fileInput.files[0]);
    });

    resetBtn.addEventListener("click", () => {
        fileInput.value = "";
        scanProcess.classList.add("hidden");
        resultSection.classList.add("hidden");
        dropZone.classList.remove("hidden");
    });

    function validateAndProcessFile(file) {
        const ext = file.name.split(".").pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            const msg = currentLang === "id"
                ? `FORMAT FILE DITOLAK (.${ext.toUpperCase()})!\n\nFile wajib berformat:\n• (.lua / .luac) untuk MonetLoader\n• (.cs / .csa / .csi) untuk CLEO\n\nEkstrak terlebih dahulu jika file masih berbentuk .zip / .rar / .7z!`
                : `FILE FORMAT REJECTED (.${ext.toUpperCase()})!\n\nFile must be:\n• (.lua / .luac) for MonetLoader\n• (.cs / .csa / .csi) for CLEO\n\nPlease extract the file first if it is inside a .zip / .rar / .7z archive!`;
            alert(msg);
            fileInput.value = "";
            return;
        }
        processFile(file, ext);
    }

    async function computeSHA256(buffer) {
        if (window.crypto && window.crypto.subtle) {
            const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16).toUpperCase();
        }
        return "LOCAL-OFFLINE";
    }

    function extractBinaryStrings(uint8Array) {
        let strings = [];
        let current = "";
        for (let i = 0; i < uint8Array.length; i++) {
            const code = uint8Array[i];
            if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
                current += String.fromCharCode(code);
            } else {
                if (current.length >= 4) strings.push(current);
                current = "";
            }
        }
        if (current.length >= 4) strings.push(current);
        return strings.join("\n");
    }

    async function processFile(file, ext) {
        dropZone.classList.add("hidden");
        resultSection.classList.add("hidden");
        scanProcess.classList.remove("hidden");

        const sizeKB = (file.size / 1024).toFixed(2);
        const typeLabel = ["lua", "luac"].includes(ext) ? "MONETLOADER SCRIPT" : "CLEO MOBILE SCRIPT";
        fileNameEl.textContent = file.name;
        fileSizeEl.textContent = `${sizeKB} KB • .${ext.toUpperCase()} (${typeLabel})`;

        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const fileHash = await computeSHA256(arrayBuffer);

        const isLuaBytecode = (uint8[0] === 0x1B && (uint8[1] === 0x4C || uint8[1] === 0x4A));
        const isCleoBinary = ["cs", "csa", "csi"].includes(ext);

        const rawText = new TextDecoder("utf-8", { fatal: false }).decode(uint8);
        const extractedText = extractBinaryStrings(uint8);
        const combinedCorpus = rawText + "\n" + extractedText;

        const steps = currentLang === "id"
            ? [
                { pct: 25, text: "Membaca header binary & signature bytecode..." },
                { pct: 55, text: "Menganalisis protokol HTTP / Webhook / Socket..." },
                { pct: 80, text: "Memeriksa hook dialog SAMP & penyadapan input..." },
                { pct: 100, text: "Menyusun laporan forensik keamanan..." }
            ]
            : [
                { pct: 25, text: "Reading binary headers & bytecode signatures..." },
                { pct: 55, text: "Analyzing HTTP / Webhook / Socket protocols..." },
                { pct: 80, text: "Inspecting SAMP dialog hooks & input listeners..." },
                { pct: 100, text: "Compiling security forensic report..." }
            ];

        for (let step of steps) {
            progressFill.style.width = step.pct + "%";
            scanPercent.textContent = step.pct + "%";
            scanStatusText.textContent = step.text;
            await new Promise(r => setTimeout(r, 200));
        }

        const analysis = runHeuristicEngine(combinedCorpus, isLuaBytecode, isCleoBinary);
        renderResults(analysis, fileHash);
    }

    function runHeuristicEngine(corpus, isLuaBytecode, isCleoBinary) {
        let score = 0;
        let findings = [];
        let suspiciousStrings = new Set();

        let hasNetwork = false;
        let hasInputHook = false;
        let isObfuscated = false;

        const isID = currentLang === "id";

        const urlRegex = /(https?:\/\/[^\s"'<>\\)\]]+)/gi;
        const urls = corpus.match(urlRegex) || [];
        urls.forEach(u => {
            suspiciousStrings.add(u);
            if (/discord(app)?\.com\/api\/webhooks/i.test(u)) {
                score += 95;
                hasNetwork = true;
                findings.push({
                    severity: "critical",
                    title: isID ? "Discord Webhook Stealer Terdeteksi!" : "Discord Webhook Stealer Detected!",
                    desc: isID
                        ? "Script mengandung URL Discord Webhook yang digunakan untuk mengirim password/akun SAMP korban secara diam-diam."
                        : "Script contains a Discord Webhook URL used to silently exfiltrate victim SAMP passwords/accounts.",
                    evidence: u
                });
            } else if (/api\.telegram\.org\/bot/i.test(u)) {
                score += 95;
                hasNetwork = true;
                findings.push({
                    severity: "critical",
                    title: isID ? "Telegram Bot Exfiltration Terdeteksi!" : "Telegram Bot Exfiltration Detected!",
                    desc: isID
                        ? "Script mengirim data curian ke bot Telegram menggunakan API token."
                        : "Script sends stolen credentials to a Telegram bot via API token.",
                    evidence: u
                });
            } else {
                score += 35;
                hasNetwork = true;
                findings.push({
                    severity: "warning",
                    title: isID ? "Koneksi URL Eksternal Ditemukan" : "External URL Connection Found",
                    desc: isID
                        ? "Script mengakses alamat web luar. Pastikan URL ini memang resmi dan bukan server penampung log."
                        : "Script connects to an external web address. Ensure this URL is legitimate.",
                    evidence: u
                });
            }
        });

        const netPatterns = [
            { regex: /\b(requests\.post|requests\.get|http\.request|socket\.http|luasocket|copas\.http|effil\.thread)\b/gi, idName: "Library HTTP / Socket Jaringan", enName: "HTTP / Socket Network Library", isIdOnly: false },
            { regex: /\b(downloadUrlToFile|sampGetCurrentServerAddress|sampGetPlayerNickname)\b/gi, idName: "Pengambilan Identitas Server & Nickname", enName: "Server IP & Player Nickname Reader", isIdOnly: true }
        ];

        netPatterns.forEach(pat => {
            const matches = corpus.match(pat.regex);
            if (matches) {
                const unique = [...new Set(matches)];
                unique.forEach(m => suspiciousStrings.add(m));
                score += pat.isIdOnly ? 15 : 55;
                if (!pat.isIdOnly) hasNetwork = true;

                findings.push({
                    severity: pat.isIdOnly ? "warning" : "critical",
                    title: isID ? pat.idName : pat.enName,
                    desc: pat.isIdOnly
                        ? (isID ? "Script membaca nickname atau IP server pemain (sering dipakai untuk pelabelan log keylogger)." : "Script reads player nickname or server IP (commonly used to tag stolen logs).")
                        : (isID ? "Script memiliki kemampuan mengirim paket data keluar melalui internet (HTTP POST/GET)." : "Script is capable of sending outbound data packets over the internet (HTTP POST/GET)."),
                    evidence: unique.join(", ")
                });
            }
        });

        const sampHookPatterns = [
            { regex: /\b(onSendDialogResponse|sampSendDialogResponse|onShowDialog|sampGetDialogText|sampGetCurrentDialogId)\b/gi, idTitle: "SAMP Dialog Hook (Penyadapan Input Password)", enTitle: "SAMP Dialog Hook (Password Input Interception)" },
            { regex: /\b(onSendCommand|onSendChat|sampProcessChatInput)\b/gi, idTitle: "SAMP Command/Chat Interceptor (/login, /register)", enTitle: "SAMP Command/Chat Interceptor (/login, /register)" },
            { regex: /\b(onWindowMessage|isKeyJustPressed|isKeyDown|wasKeyPressed|vkeys)\b/gi, idTitle: "Keyboard / Keystroke Listener", enTitle: "Keyboard / Keystroke Listener" }
        ];

        sampHookPatterns.forEach(pat => {
            const matches = corpus.match(pat.regex);
            if (matches) {
                const unique = [...new Set(matches)];
                hasInputHook = true;
                score += hasNetwork ? 50 : 20;

                findings.push({
                    severity: hasNetwork ? "critical" : "warning",
                    title: isID ? pat.idTitle : pat.enTitle,
                    desc: hasNetwork
                        ? (isID ? "BERBAHAYA: Script menyadap input dialog/command SAMP DAN memiliki akses internet untuk mengirimkannya keluar!" : "DANGEROUS: Script intercepts SAMP dialog/command inputs AND has internet access to exfiltrate them!")
                        : (isID ? "Script memantau dialog atau tombol keyboard (wajar jika untuk menu mod, berbahaya jika digabung pengiriman data)." : "Script monitors dialogs or keystrokes (normal for mod menus, dangerous if paired with network requests)."),
                    evidence: unique.join(", ")
                });
            }
        });

        if (isCleoBinary) {
            const cleoPatterns = [
                { regex: /(0B4B|0B4C|0B49|0BD7|samp_dialog|send_dialog)/gi, idTitle: "CLEO SAMP Dialog Opcode", enTitle: "CLEO SAMP Dialog Opcode" },
                { regex: /(0AB0|0ADC|key_pressed)/gi, idTitle: "CLEO Keypress Detection Opcode", enTitle: "CLEO Keypress Detection Opcode" },
                { regex: /(http|socket|curl|post|webhook|passwd|password|pin_code)/gi, idTitle: "String Mencurigakan di Binary CLEO", enTitle: "Suspicious String in CLEO Binary" }
            ];

            cleoPatterns.forEach(pat => {
                const matches = corpus.match(pat.regex);
                if (matches) {
                    const unique = [...new Set(matches)];
                    unique.forEach(m => suspiciousStrings.add(m));
                    score += 35;
                    hasInputHook = true;
                    findings.push({
                        severity: "warning",
                        title: isID ? pat.idTitle : pat.enTitle,
                        desc: isID ? "Ditemukan instruksi atau string sensitif di dalam bytecode CLEO Mobile." : "Sensitive instruction or string detected inside CLEO Mobile bytecode.",
                        evidence: unique.join(", ")
                    });
                }
            });
        }

        const obfSignatures = [
            { regex: /(MoonSec|Luraph|IronBrew|PSU|Obfuscated|Protected by)/i, idLabel: "Commercial Lua Obfuscator (MoonSec/Luraph/IronBrew)", enLabel: "Commercial Lua Obfuscator (MoonSec/Luraph/IronBrew)" },
            { regex: /\b(loadstring|load\s*\(|string\.dump|io\.popen|os\.execute)\b/gi, idLabel: "Dynamic Code Execution (loadstring / os.execute)", enLabel: "Dynamic Code Execution (loadstring / os.execute)" }
        ];

        obfSignatures.forEach(sig => {
            const match = corpus.match(sig.regex);
            if (match) {
                isObfuscated = true;
                score += 40;
                findings.push({
                    severity: "warning",
                    title: isID ? sig.idLabel : sig.enLabel,
                    desc: isID ? "Kode sumber sengaja disembunyikan/diacak agar isi aslinya tidak bisa dibaca manusia." : "Source code is intentionally obfuscated to hide its true behavior.",
                    evidence: [...new Set(match)].join(", ")
                });
            }
        });

        const escapedBytes = corpus.match(/(\\\d{2,3}){8,}/g);
        if (escapedBytes) {
            isObfuscated = true;
            score += 45;
            escapedBytes.forEach(eb => suspiciousStrings.add(eb.slice(0, 60) + "..."));
            findings.push({
                severity: "critical",
                title: isID ? "Encoded ASCII Payload Tersembunyi" : "Hidden Encoded ASCII Payload",
                desc: isID ? "Ditemukan rangkaian angka ASCII panjang yang disamarkan untuk menyembunyikan URL webhook." : "Long sequence of escaped ASCII numbers found disguising a hidden webhook URL.",
                evidence: escapedBytes[0].slice(0, 70) + "..."
            });
        }

        if (isLuaBytecode) {
            isObfuscated = true;
            score += 15;
            findings.push({
                severity: "warning",
                title: isID ? "File Terkompilasi (LuaJIT / .luac Bytecode)" : "Compiled File (LuaJIT / .luac Bytecode)",
                desc: isID ? "File ini sudah dicompile menjadi bytecode biner. Engine telah mengekstrak seluruh string tersembunyi di dalamnya." : "This file is compiled binary bytecode. All embedded strings have been extracted for inspection.",
                evidence: "Header: 0x1B 0x4C (Compiled Lua)"
            });
        }

        score = Math.min(100, score);

        if (findings.length === 0) {
            findings.push({
                severity: "clean",
                title: isID ? "Tidak Ditemukan Pola Keylogger maupun Stealer" : "No Keylogger or Stealer Patterns Found",
                desc: isID ? "Tidak ada koneksi HTTP/Webhook, penyadapan dialog login SAMP, ataupun kode terenkripsi mencurigakan." : "No HTTP/Webhook connections, SAMP login dialog hooks, or suspicious encrypted payloads detected.",
                evidence: null
            });
        }

        return {
            score,
            findings,
            suspiciousStrings: [...suspiciousStrings],
            hasNetwork,
            hasInputHook,
            isObfuscated
        };
    }

    function renderResults(data, fileHash) {
        const isID = currentLang === "id";
        resultSection.classList.remove("hidden");
        hashDisplay.textContent = `SHA-256: ${fileHash}`;
        riskScoreEl.textContent = `${data.score}%`;

        verdictCard.classList.remove("status-safe", "status-warn", "status-danger");

        if (data.score >= 60) {
            verdictCard.classList.add("status-danger");
            verdictTitle.textContent = isID ? "TERDETEKSI KEYLOGGER / STEALER!" : "KEYLOGGER / STEALER DETECTED!";
            verdictSummary.textContent = isID
                ? "JANGAN PASANG FILE INI! Script terdeteksi memiliki mekanisme pencurian data/password SAMP atau mengirimkan informasi keluar melalui jaringan."
                : "DO NOT INSTALL THIS FILE! This script contains SAMP credential-stealing mechanisms or outbound network exfiltration.";
            verdictIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        } else if (data.score >= 20) {
            verdictCard.classList.add("status-warn");
            verdictTitle.textContent = isID ? "MENCURIGAKAN (PERLU WASPADA)" : "SUSPICIOUS (USE WITH CAUTION)";
            verdictSummary.textContent = isID
                ? "Script memiliki akses ke dialog SAMP, koneksi luar, atau kode terenkripsi/compiled. Pastikan Anda mengunduhnya dari pembuat terpercaya."
                : "Script accesses SAMP dialogs, external connections, or compiled/obfuscated code. Ensure it comes from a trusted author.";
            verdictIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        } else {
            verdictCard.classList.add("status-safe");
            verdictTitle.textContent = isID ? "AMAN / BERSIH" : "SAFE / CLEAN";
            verdictSummary.textContent = isID
                ? "Tidak ditemukan indikasi keylogger, webhook stealer, maupun aktivitas pengiriman data berbahaya. Script aman digunakan di SAMP Mobile."
                : "No keylogger indicators, webhook stealers, or malicious outbound transfers found. Safe to use on SAMP Mobile.";
            verdictIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`;
        }

        metricNetwork.textContent = data.hasNetwork ? (isID ? "Terdeteksi!" : "Detected!") : (isID ? "Tidak Ada" : "None");
        metricNetwork.className = "metric-val " + (data.hasNetwork ? "danger" : "safe");

        metricHook.textContent = data.hasInputHook ? (isID ? "Aktif" : "Active") : "Normal";
        metricHook.className = "metric-val " + (data.hasInputHook ? "warn" : "safe");

        metricObf.textContent = data.isObfuscated ? (isID ? "Terkunci/Compile" : "Locked/Compiled") : (isID ? "Terbuka" : "Open Source");
        metricObf.className = "metric-val " + (data.isObfuscated ? "warn" : "safe");

        const threatCount = data.findings.filter(f => f.severity !== "clean").length;
        metricThreats.textContent = isID ? `${threatCount} Temuan` : `${threatCount} Found`;
        metricThreats.className = "metric-val " + (threatCount > 0 ? (data.score >= 60 ? "danger" : "warn") : "safe");

        findingsList.innerHTML = "";
        data.findings.forEach(item => {
            const div = document.createElement("div");
            div.className = `finding-item ${item.severity}`;
            const sevLabel = item.severity === "critical"
                ? (isID ? "BAHAYA" : "CRITICAL")
                : (item.severity === "warning" ? (isID ? "PERINGATAN" : "WARNING") : (isID ? "AMAN" : "SAFE"));
            div.innerHTML = `
                <div class="finding-top">
                    <span class="finding-title">${item.title}</span>
                    <span class="badge-sev">${sevLabel}</span>
                </div>
                <p class="finding-desc">${item.desc}</p>
                ${item.evidence ? `<div class="finding-evidence">${escapeHTML(item.evidence)}</div>` : ""}
            `;
            findingsList.appendChild(div);
        });

        if (data.suspiciousStrings.length > 0) {
            stringsCard.classList.remove("hidden");
            extractedStrings.textContent = data.suspiciousStrings.join("\n");
        } else {
            stringsCard.classList.add("hidden");
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, m => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[m]));
    }
});
