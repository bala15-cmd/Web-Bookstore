const container = document.getElementById("book-container");
const cartCount = document.getElementById("cart-count");
const searchInput = document.getElementById("search-input");
const bestSeller = document.getElementById("best-seller");

/* ================= CART SYSTEM ================= */

const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* ===== FIX DỮ LIỆU GIỎ CŨ ===== */
if(cart.length > 0 && typeof cart[0] === "number"){
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
}

updateCartCount();
renderCart();
/* MỞ / ĐÓNG GIỎ */
function toggleCart(){
    cartPanel.classList.toggle("active");
    cartOverlay.classList.toggle("active");
}

/* CLICK ICON GIỎ */
document.querySelector(".menu span").addEventListener("click", toggleCart);

/* THÊM GIỎ */
function addCart(id){
    const item = cart.find(i => i.id === id);

    if(item){
        item.qty++;
    }else{
        cart.push({id:id, qty:1});
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

/* RENDER GIỎ */
function renderCart(){
    if(!cartItems) return;

    cartItems.innerHTML = "";
    let total = 0;

    if(cart.length === 0){
        cartItems.innerHTML = "<p>Giỏ hàng trống</p>";
        cartTotal.innerText = "0";
        return;
    }

    cart.forEach(item=>{
        const book = books.find(b => b.id === item.id);
        let price = book.price;

if(book.discount && book.discount > 0){
    price = book.price - (book.price * book.discount / 100);
}

total += price * item.qty;  
        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${book.image}">
                <div style="flex:1">
                    <p><b>${book.name}</b></p>
                    <p class="price">${book.price.toLocaleString()}đ</p>

                    <div class="qty-box">
                        <button onclick="changeQty(${item.id}, -1)">−</button>
                        <span>${item.qty}</span>
                        <button onclick="changeQty(${item.id}, 1)">+</button>
                        <button onclick="removeItem(${item.id})" style="background:#999">x</button>
                    </div>
                </div>
            </div>
        `;
    });

    cartTotal.innerText = total.toLocaleString();
}

/* TĂNG GIẢM */
function changeQty(id, amount){
    const item = cart.find(i => i.id === id);
    if(!item) return;

    item.qty += amount;

    if(item.qty <= 0){
        cart = cart.filter(i => i.id !== id);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

/* XOÁ */
function removeItem(id){
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

/* ĐẾM SỐ LƯỢNG */
function updateCartCount(){
    let count = 0;

    cart.forEach(i => {
        if(typeof i === "object"){
            count += i.qty;
        }
    });

    cartCount.innerText = count;
}

/* THANH TOÁN */
function checkout(){

    if(!currentUser){
        alert("Vui lòng đăng nhập để thanh toán!");
        accountModal.style.display = "flex";
        return;
    }

    if(cart.length === 0){
        alert("Giỏ hàng trống!");
        return;
    }

    document.getElementById("checkout-modal").style.display = "flex";
}
function confirmCheckout(){

    const name = document.getElementById("checkout-name").value;
    const phone = document.getElementById("checkout-phone").value;
    const address = document.getElementById("checkout-address").value;
    const method = document.getElementById("checkout-method").value;
    
    if(!name || !phone || !address){
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    let total = 0;

    cart.forEach(item=>{
        const book = books.find(b => b.id === item.id);
        let price = book.price;

if(book.discount && book.discount > 0){
    price = book.price - (book.price * book.discount / 100);
}

total += price * item.qty;
    });

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex(u => u.username === currentUser.username);

    const order = {
        items: cart,
        total: total,
        name: name,
        phone: phone,
        address: address,
        method: method,
        date: new Date().toLocaleString()
    };

    users[index].orders.push(order);

    localStorage.setItem("users", JSON.stringify(users));

    // CẬP NHẬT LẠI currentUser
    currentUser = users[index];
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    alert("Thanh toán thành công!");

    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();
    renderCart();

    document.getElementById("checkout-modal").style.display = "none";
}
/* ================== PHÂN TRANG ================== */
const booksPerPage = 12;
let currentPage = 1;
let currentList = books;
function getFinalPrice(book) {
    if (book.discount && book.discount > 0) {
        return book.price - (book.price * book.discount / 100);
    }
    return book.price;
}

/* ================== RENDER SÁCH ================== */
function renderBooks(list){

    currentList = list;
    container.innerHTML = "";

    const start = (currentPage - 1) * booksPerPage;
    const end = start + booksPerPage;
    const booksToShow = list.slice(start, end);

    booksToShow.forEach(book=>{
        const finalPrice = getFinalPrice(book);

        let discountHTML = "";
        let saleBadge = "";

        if(book.discount && book.discount > 0){
            discountHTML = `
                <p style="text-decoration:line-through;color:gray">
                    ${book.price.toLocaleString()}đ
                </p>
            `;

            saleBadge = `
                <div style="
                    position:absolute;
                    top:10px;
                    left:10px;
                    background:red;
                    color:white;
                    padding:5px 8px;
                    font-size:12px;
                    border-radius:5px;">
                    -${book.discount}%
                </div>
            `;
        }

        container.innerHTML += `
            <div class="book" style="position:relative" onclick="showDetail(${book.id})">
                ${saleBadge}
                <img src="${book.image}">
                <h4>${book.name}</h4>
                <p>${book.category}</p>
                ${discountHTML}
                <p class="price">${finalPrice.toLocaleString()}đ</p>
                <div class="card-actions">
    <button onclick="event.stopPropagation(); addCart(${book.id}); showToast('Đã thêm vào giỏ');">
        Thêm vào giỏ
    </button>

    <button class="buy-now"
        onclick="event.stopPropagation(); addCart(${book.id}); checkout();">
        Mua ngay
    </button>
</div>
        `;
    });

    renderPagination();
}
function renderPagination(){

    const totalPages = Math.ceil(currentList.length / booksPerPage);

    let paginationHTML = `<div class="pagination">`;

    paginationHTML += `<button onclick="goToPage(1)">Đầu</button>`;

    for(let i = 1; i <= totalPages; i++){
        paginationHTML += `
            <button class="${i === currentPage ? 'active' : ''}" 
                onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }

    paginationHTML += `<button onclick="goToPage(${totalPages})">Cuối</button>`;
    paginationHTML += `</div>`;

    const wrapper = document.getElementById("pagination-wrapper");
    wrapper.innerHTML = paginationHTML;
}
function goToPage(page){
    currentPage = page;
    renderBooks(currentList);
    window.scrollTo({ top: 0, behavior: "smooth" });
}
/* ================== RENDER BÁN CHẠY ================== */
function renderBestSeller(){
    if(!bestSeller) return;
    const bestBooks = books.filter(book => book.best === true);
    
    const shuffle = () => {
        // Trộn và chỉ lấy đúng 4 cuốn
        const shuffled = [...bestBooks].sort(() => 0.5 - Math.random()).slice(0, 4);
        bestSeller.innerHTML = shuffled.map(book => `
    <div class="best-item">

        <img src="${book.image}" onclick="showDetail(${book.id})">

        <div class="best-info">
            <p>${book.name}</p>
            <b class="price">
                ${getFinalPrice(book).toLocaleString()}đ
            </b>

            <div class="best-actions">
                <button onclick="addCart(${book.id})">
                    Thêm
                </button>

                <button class="buy-now"
                    onclick="addCart(${book.id}); checkout();">
                    Mua
                </button>
            </div>
        </div>

    </div>
`).join('');
    };
    shuffle(); 
    setInterval(shuffle, 20000); // đổi xách nổi bật
}
function showToast(msg) {
    let box = document.getElementById('toast-container');
    if(!box) {
        box = document.createElement('div');
        box.id = 'toast-container';
        document.body.appendChild(box);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `✅ ${msg}`;
    box.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}
/* ================== TÌM KIẾM ================== */
if(searchInput){
    searchInput.addEventListener("input", ()=>{
        const keyword = searchInput.value.toLowerCase();
        const filtered = books.filter(book =>
            book.name.toLowerCase().includes(keyword)
        );
        currentPage = 1;
renderBooks(filtered);
    });
}

/* ================== LỌC DANH MỤC ================== */
document.querySelectorAll(".sidebar-left li").forEach(item=>{
    item.addEventListener("click", ()=>{
        const category = item.innerText;
        const filtered = books.filter(book =>
            book.category === category
        );
        currentPage = 1;
renderBooks(filtered);
    });
});

/* ================== SLIDER ================== */
let slides = document.querySelectorAll(".slide");
let current = 0;
if(slides.length > 0){
    setInterval(()=>{
        slides[current].classList.remove("active");
        current = (current + 1) % slides.length;
        slides[current].classList.add("active");
    }, 30000); // chuyển slider
}

/* ================== CHI TIẾT SÁCH ================== */
function showDetail(id){
    const book = books.find(b => b.id === id);
    const modal = document.getElementById("book-modal");
    const detail = document.getElementById("book-detail");

    detail.innerHTML = `
    <div class="modal-box">

        <span class="close-btn" onclick="closeModal()">✖</span>

        <div class="modal-left">
            <img src="${book.image}" alt="${book.name}">
        </div>

        <div class="modal-right">
            <h2>${book.name}</h2>

            <p><b>Tác giả:</b> ${book.author}</p>
            <p><b>Năm sáng tác:</b> ${book.writtenYear}</p>
            <p><b>Ngày xuất bản:</b> ${book.publishDate}</p>
            <p><b>Thể loại:</b> ${book.category}</p>

            <p class="desc">${book.description}</p>

            <div class="modal-price">
                ${getFinalPrice(book).toLocaleString()}đ
            </div>

            <div class="modal-actions">
                <button onclick="addCart(${book.id})">
                    Thêm vào giỏ
                </button>

                <button class="buy-now"
                    onclick="addCart(${book.id}); checkout();">
                    Mua ngay
                </button>
            </div>
        </div>

    </div>
`;

    modal.classList.add("show");
}

function closeModal(){
    document.getElementById("book-modal").classList.remove("show");
}
/* ================= ACCOUNT SYSTEM ================= */
const accountBtn = document.getElementById("account-btn");
const accountModal = document.getElementById("account-modal");
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("account-dashboard");
const welcomeUser = document.getElementById("welcome-user");
const accountContent = document.getElementById("account-content");

let currentUser = JSON.parse(localStorage.getItem("currentUser"));

updateAccountUI();

accountBtn.addEventListener("click", ()=>{
    accountModal.style.display = "flex";
});

accountModal.addEventListener("click", (e)=>{
    if(e.target.id === "account-modal"){
        accountModal.style.display = "none";
    }
});

loginTab.addEventListener("click", ()=>{
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.style.display = "flex";
    registerForm.style.display = "none";
});

registerTab.addEventListener("click", ()=>{
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    loginForm.style.display = "none";
    registerForm.style.display = "flex";
});

/* REGISTER */
function register(){
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm").value;
    const fullname = document.getElementById("reg-fullname").value;
    const email = document.getElementById("reg-email").value;
    const phone = document.getElementById("reg-phone").value;
    const address = document.getElementById("reg-address").value;

    if(password !== confirm){
        alert("Mật khẩu không khớp!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if(users.find(u => u.username === username)){
        alert("Tài khoản đã tồn tại!");
        return;
    }

    users.push({
        username,
        password,
        fullname,
        email,
        phone,
        address,
        orders:[]
    });

    localStorage.setItem("users", JSON.stringify(users));
    alert("Đăng ký thành công!");

    /* CHUYỂN VỀ LOGIN */
    loginTab.click();
}

function login(){
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u => u.username === username && u.password === password);

    if(!user){
        alert("Sai tài khoản hoặc mật khẩu!");
        return;
    }

    // đảm bảo user có đủ field (tránh undefined)
    user.fullname = user.fullname || "";
    user.email = user.email || "";
    user.phone = user.phone || "";
    user.address = user.address || "";
    user.orders = user.orders || [];

    localStorage.setItem("currentUser", JSON.stringify(user));
    currentUser = user;

    updateAccountUI();
}
/* LOGOUT */
function logout(){
    localStorage.removeItem("currentUser");
    location.reload();

    // reset toàn bộ giao diện
    accountBtn.innerText = "👤 Tài khoản";

    authSection.style.display = "block";
    dashboard.style.display = "none";

    loginForm.style.display = "flex";
    registerForm.style.display = "none";

    // xoá nội dung hiển thị
    accountContent.innerHTML = "";
    welcomeUser.innerText = "";

    // clear input login
    document.getElementById("login-username").value = "";
    document.getElementById("login-password").value = "";
    // đóng modal luôn cho sạch
    accountModal.style.display = "none";
}
/* UPDATE UI */
function updateAccountUI(){
    if(currentUser){
        accountBtn.innerText = "👤 " + currentUser.username;
        authSection.style.display = "none";
        dashboard.style.display = "block";
        welcomeUser.innerText = "Xin chào, " + (currentUser.fullname || "");
        accountContent.innerHTML = "";
    }else{
        accountBtn.innerText = "👤 Tài khoản";
        authSection.style.display = "block";
        dashboard.style.display = "none";
        accountContent.innerHTML = "";
    }
}

/* PROFILE */
function showProfile(){
    if(!currentUser) return;

    accountContent.innerHTML = `
        <p><b>Họ tên:</b> ${currentUser.fullname || ""}</p>
        <p><b>Email:</b> ${currentUser.email || ""}</p>
        <p><b>SĐT:</b> ${currentUser.phone || ""}</p>
        <p><b>Địa chỉ:</b> ${currentUser.address || ""}</p>
    `;
}

/* ORDER HISTORY */
function showOrders(){
    if(!currentUser) return;

    if(!currentUser.orders || currentUser.orders.length === 0){
        accountContent.innerHTML = "<p>Chưa có đơn hàng nào.</p>";
        return;
    }

    let html = "";

    currentUser.orders.forEach((order,index)=>{
        html += `
            <div style="margin-bottom:15px;border-bottom:1px solid #eee;padding-bottom:10px">
                <p><b>Đơn hàng #${index+1}</b></p>
                <p>Ngày: ${order.date}</p>
                <p>Người nhận: ${order.name}</p>
                <p>SĐT: ${order.phone}</p>
                <p>Địa chỉ: ${order.address}</p>
                <p>Phương thức: ${order.method}</p>
                <p><b>Tổng tiền: ${order.total.toLocaleString()}đ</b></p>
            </div>
        `;
    });

    accountContent.innerHTML = html;
}
/* ================== SÁCH GIẢM GIÁ ================== */
const saleBtn = document.querySelector(".sale-btn");

if (saleBtn) {
    saleBtn.addEventListener("click", function () {

        const saleBooks = books.filter(book => 
            book.discount && book.discount > 0
        );

        if (saleBooks.length === 0) {
            alert("Hiện tại chưa có sách giảm giá.");
            return;
        }

        renderBooks(saleBooks);
    });
}document.querySelector(".logo").addEventListener("click", function(){
    renderBooks(books);

});
renderBooks(books);
renderBestSeller();
document.getElementById("checkout-modal")
    .addEventListener("click", function(e){
        if(e.target.id === "checkout-modal"){
            this.style.display = "none";
        }
});