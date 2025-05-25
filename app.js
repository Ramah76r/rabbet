// تهيئة قاعدة البيانات
let db;
const DB_NAME = 'RabbitFarmDB';
const DB_VERSION = 1;

// تشغيل التطبيق
function initRabbitFarm(containerId) {
    console.log('تهيئة نظام إدارة مزرعة الأرانب...');
    const container = document.getElementById(containerId);
    
    // تحقق من دعم المتصفح لـ IndexedDB
    if (!window.indexedDB) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <h4>خطأ في المتصفح</h4>
                <p>متصفحك لا يدعم تخزين البيانات محلياً (IndexedDB). يرجى استخدام متصفح حديث مثل Chrome أو Firefox أو Edge.</p>
            </div>
        `;
        return;
    }
    
    // فتح قاعدة البيانات
    initDatabase()
        .then(() => {
            renderApp(container);
        })
        .catch(error => {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <h4>خطأ في قاعدة البيانات</h4>
                    <p>${error.message}</p>
                </div>
            `;
        });
}

// تهيئة قاعدة البيانات
function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = event => {
            reject(new Error('فشل في فتح قاعدة البيانات: ' + event.target.error));
        };
        
        request.onsuccess = event => {
            db = event.target.result;
            console.log('تم فتح قاعدة البيانات بنجاح');
            resolve();
        };
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            
            // إنشاء مخازن البيانات
            if (!db.objectStoreNames.contains('rabbits')) {
                const rabbitsStore = db.createObjectStore('rabbits', { keyPath: 'id', autoIncrement: true });
                rabbitsStore.createIndex('name', 'name', { unique: false });
                rabbitsStore.createIndex('gender', 'gender', { unique: false });
                rabbitsStore.createIndex('status', 'status', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('breeding')) {
                const breedingStore = db.createObjectStore('breeding', { keyPath: 'id', autoIncrement: true });
                breedingStore.createIndex('date', 'breedingDate', { unique: false });
                breedingStore.createIndex('fatherId', 'fatherId', { unique: false });
                breedingStore.createIndex('motherId', 'motherId', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('health')) {
                const healthStore = db.createObjectStore('health', { keyPath: 'id', autoIncrement: true });
                healthStore.createIndex('date', 'date', { unique: false });
                healthStore.createIndex('rabbitId', 'rabbitId', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('feed')) {
                const feedStore = db.createObjectStore('feed', { keyPath: 'id', autoIncrement: true });
                feedStore.createIndex('date', 'date', { unique: false });
                feedStore.createIndex('type', 'type', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('finance')) {
                const financeStore = db.createObjectStore('finance', { keyPath: 'id', autoIncrement: true });
                financeStore.createIndex('date', 'date', { unique: false });
                financeStore.createIndex('type', 'type', { unique: false });
            }
            
            console.log('تم إنشاء قاعدة البيانات وجداولها');
        };
    });
}

// عرض التطبيق
function renderApp(container) {
    // قائمة التنقل
    const navbar = createNavbar();
    
    // المحتوى الرئيسي
    const content = document.createElement('div');
    content.id = 'app-content';
    content.className = 'container mt-4';
    
    // عرض الصفحة الرئيسية افتراضياً
    renderDashboard(content);
    
    // إضافة العناصر للحاوية
    container.innerHTML = '';
    container.appendChild(navbar);
    container.appendChild(content);
    
    // إضافة مستمعات الأحداث للتنقل
    attachNavEvents();
}

// إنشاء قائمة التنقل
function createNavbar() {
    const navbar = document.createElement('nav');
    navbar.className = 'navbar navbar-expand-lg navbar-dark bg-primary';
    navbar.innerHTML = `
        <div class="container">
            <a class="navbar-brand" href="#">نظام إدارة مزرعة الأرانب</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#dashboard" data-page="dashboard">الرئيسية</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#rabbits" data-page="rabbits">الأرانب</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#breeding" data-page="breeding">التزاوج</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#health" data-page="health">الصحة</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#feed" data-page="feed">التغذية</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#finance" data-page="finance">المالية</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#reports" data-page="reports">التقارير</a>
                    </li>
                </ul>
            </div>
        </div>
    `;
    return navbar;
}

// إضافة مستمعات الأحداث للتنقل
function attachNavEvents() {
    const navLinks = document.querySelectorAll('.nav-link');
    const content = document.getElementById('app-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة الفئة النشطة من جميع الروابط
            navLinks.forEach(l => l.classList.remove('active'));
            
            // إضافة الفئة النشطة للرابط المختار
            this.classList.add('active');
            
            // تحديد الصفحة المطلوبة
            const page = this.getAttribute('data-page');
            
            // عرض الصفحة المطلوبة
            switch(page) {
                case 'dashboard':
                    renderDashboard(content);
                    break;
                case 'rabbits':
                    renderRabbits(content);
                    break;
                case 'breeding':
                    renderBreeding(content);
                    break;
                case 'health':
                    renderHealth(content);
                    break;
                case 'feed':
                    renderFeed(content);
                    break;
                case 'finance':
                    renderFinance(content);
                    break;
                case 'reports':
                    renderReports(content);
                    break;
                default:
                    renderDashboard(content);
            }
        });
    });
    
    // تنشيط الرابط الأول (الرئيسية) افتراضياً
    navLinks[0].classList.add('active');
}

// عرض الصفحة الرئيسية
function renderDashboard(container) {
    container.innerHTML = `
        <div class="row">
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h2 class="card-title">لوحة المعلومات</h2>
                        <p class="card-text">مرحباً بك في نظام إدارة مزرعة الأرانب!</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 class="card-title">إجمالي الأرانب</h5>
                        <p class="card-text display-4" id="total-rabbits">0</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 class="card-title">عمليات التزاوج الحالية</h5>
                        <p class="card-text display-4" id="active-breedings">0</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 class="card-title">الولادات المتوقعة هذا الشهر</h5>
                        <p class="card-text display-4" id="expected-births">0</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // تحديث الإحصائيات
    updateDashboardStats();
}

// تحديث إحصائيات لوحة المعلومات
function updateDashboardStats() {
    // عدد الأرانب
    countRecords('rabbits').then(count => {
        document.getElementById('total-rabbits').textContent = count;
    });
    
    // عدد عمليات التزاوج النشطة
    // في التطبيق الحقيقي، سنقوم بعمل استعلام أكثر تعقيدًا
    countRecords('breeding').then(count => {
        document.getElementById('active-breedings').textContent = count;
    });
    
    // عدد الولادات المتوقعة هذا الشهر
    // في التطبيق الحقيقي، سنقوم بعمل استعلام أكثر تعقيدًا
    document.getElementById('expected-births').textContent = '0';
}

// عرض صفحة الأرانب
function renderRabbits(container) {
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>إدارة الأرانب</h2>
            <button class="btn btn-primary" id="add-rabbit-btn">
                <i class="bi bi-plus-circle"></i> إضافة أرنب جديد
            </button>
        </div>
        
        <div class="card mb-4">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>الرقم</th>
                                <th>الاسم</th>
                                <th>النوع</th>
                                <th>الجنس</th>
                                <th>تاريخ الميلاد</th>
                                <th>الحالة</th>
                                <th>العمليات</th>
                            </tr>
                        </thead>
                        <tbody id="rabbits-table">
                            <tr>
                                <td colspan="7" class="text-center">جاري تحميل البيانات...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- نموذج إضافة أرنب جديد -->
        <div class="modal fade" id="rabbit-modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="rabbit-modal-title">إضافة أرنب جديد</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="rabbit-form">
                            <input type="hidden" id="rabbit-id">
                            <div class="mb-3">
                                <label for="rabbit-name" class="form-label">الاسم</label>
                                <input type="text" class="form-control" id="rabbit-name" required>
                            </div>
                            <div class="mb-3">
                                <label for="rabbit-breed" class="form-label">النوع</label>
                                <input type="text" class="form-control" id="rabbit-breed" required>
                            </div>
                            <div class="mb-3">
                                <label for="rabbit-gender" class="form-label">الجنس</label>
                                <select class="form-select" id="rabbit-gender" required>
                                    <option value="">اختر الجنس</option>
                                    <option value="ذكر">ذكر</option>
                                    <option value="أنثى">أنثى</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="rabbit-birthdate" class="form-label">تاريخ الميلاد</label>
                                <input type="date" class="form-control" id="rabbit-birthdate" required>
                            </div>
                            <div class="mb-3">
                                <label for="rabbit-status" class="form-label">الحالة</label>
                                <select class="form-select" id="rabbit-status" required>
                                    <option value="">اختر الحالة</option>
                                    <option value="نشط">نشط</option>
                                    <option value="حامل">حامل</option>
                                    <option value="مريض">مريض</option>
                                    <option value="غير نشط">غير نشط</option>
                                    <option value="متوفي">متوفي</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="rabbit-image" class="form-label">صورة الأرنب</label>
                                <input type="file" class="form-control" id="rabbit-image" accept="image/*">
                            </div>
                            <div class="mb-3">
                                <label for="rabbit-notes" class="form-label">ملاحظات</label>
                                <textarea class="form-control" id="rabbit-notes" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                        <button type="button" class="btn btn-primary" id="save-rabbit-btn">حفظ</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // تحميل بيانات الأرانب
    loadRabbits();
    
    // إضافة مستمعات الأحداث
    document.getElementById('add-rabbit-btn').addEventListener('click', () => {
        // إعادة تعيين النموذج
        document.getElementById('rabbit-form').reset();
        document.getElementById('rabbit-id').value = '';
        document.getElementById('rabbit-modal-title').textContent = 'إضافة أرنب جديد';
        
        // عرض النموذج
        new bootstrap.Modal(document.getElementById('rabbit-modal')).show();
    });
    
    document.getElementById('save-rabbit-btn').addEventListener('click', saveRabbit);
}

// تحميل بيانات الأرانب
function loadRabbits() {
    const tableBody = document.getElementById('rabbits-table');
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">جاري تحميل البيانات...</td></tr>';
    
    getAllRecords('rabbits')
        .then(rabbits => {
            if (rabbits.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد أرانب مسجلة</td></tr>';
                return;
            }
            
            tableBody.innerHTML = '';
            rabbits.forEach(rabbit => {
                const birthDate = rabbit.birthDate ? new Date(rabbit.birthDate).toLocaleDateString('ar') : '-';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${rabbit.id}</td>
                    <td>${rabbit.name}</td>
                    <td>${rabbit.breed}</td>
                    <td>${rabbit.gender}</td>
                    <td>${birthDate}</td>
                    <td>
                        <span class="badge ${getStatusBadgeClass(rabbit.status)}">
                            ${rabbit.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-rabbit" data-id="${rabbit.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-rabbit" data-id="${rabbit.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // إضافة مستمعات الأحداث للأزرار
            addRabbitButtonListeners();
        })
        .catch(error => {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">خطأ: ${error.message}</td></tr>`;
        });
}

// إضافة مستمعات الأحداث لأزرار تحرير وحذف الأرانب
function addRabbitButtonListeners() {
    // أزرار التحرير
    document.querySelectorAll('.edit-rabbit').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editRabbit(id);
        });
    });
    
    // أزرار الحذف
    document.querySelectorAll('.delete-rabbit').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteRabbit(id);
        });
    });
}

// تحرير أرنب
function editRabbit(id) {
    getRecord('rabbits', id)
        .then(rabbit => {
            if (!rabbit) {
                alert('الأرنب غير موجود');
                return;
            }
            
            // ملء النموذج بالبيانات
            document.getElementById('rabbit-id').value = rabbit.id;
            document.getElementById('rabbit-name').value = rabbit.name || '';
            document.getElementById('rabbit-breed').value = rabbit.breed || '';
            document.getElementById('rabbit-gender').value = rabbit.gender || '';
            document.getElementById('rabbit-status').value = rabbit.status || '';
            document.getElementById('rabbit-notes').value = rabbit.notes || '';
            
            if (rabbit.birthDate) {
                const birthDate = new Date(rabbit.birthDate);
                const formattedDate = birthDate.toISOString().split('T')[0];
                document.getElementById('rabbit-birthdate').value = formattedDate;
            } else {
                document.getElementById('rabbit-birthdate').value = '';
            }
            
            // تحديث عنوان النموذج
            document.getElementById('rabbit-modal-title').textContent = 'تعديل بيانات الأرنب';
            
            // عرض النموذج
            new bootstrap.Modal(document.getElementById('rabbit-modal')).show();
        })
        .catch(error => {
            alert('خطأ في تحميل بيانات الأر
