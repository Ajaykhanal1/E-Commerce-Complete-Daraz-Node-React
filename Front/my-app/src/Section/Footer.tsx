import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-100 text-gray-700 mt-10">

      {/* ================= TOP LINKS SECTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 p-10 border-b">

        {/* Customer Care */}
        <div>
          <h3 className="text-blue-600 font-bold mb-3">Customer Care</h3>
          <ul className="space-y-1 text-sm text-blue-600">
            <li><a href="#" className="hover:underline">Help Center</a></li>
            <li><a href="#" className="hover:underline">How to Buy</a></li>
            <li><a href="#" className="hover:underline">Returns & Refunds</a></li>
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">Shipping & Delivery</a></li>
          </ul>
        </div>

        {/* Daraz Info */}
        <div>
          <h3 className="text-blue-600 font-bold mb-3">Daraz</h3>
          <ul className="space-y-1 text-sm text-blue-600">
            <li><a href="#" className="hover:underline">About Daraz</a></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
            <li><a href="#" className="hover:underline">Affiliate Program</a></li>
            <li><a href="#" className="hover:underline">Sell on Daraz</a></li>
          </ul>
        </div>

        {/* Earn With Us */}
        <div>
          <h3 className="text-blue-600 font-bold mb-3">Earn With Us</h3>
          <ul className="space-y-1 text-sm text-blue-600">
            <li><a href="#" className="hover:underline">Sell on Daraz</a></li>
            <li><a href="#" className="hover:underline">Code of Conduct</a></li>
            <li><a href="#" className="hover:underline">Join Affiliate</a></li>
            <li><a href="#" className="hover:underline">Become Seller</a></li>
          </ul>
        </div>

        {/* App Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img
              className="w-12 h-12"
              src="https://img.lazcdn.com/us/domino/da7668ef-2724-447a-951a-558dafdfb265_NP-60-60.png"
              alt="logo"
            />
            <div>
              <p className="text-red-500 font-semibold">Happy Shopping</p>
              <p className="text-sm text-gray-600">Download App</p>
            </div>
          </div>

          <img
            className="w-40"
            src="https://img.lazcdn.com/us/domino/afd80417-f3df-464e-bc1a-78d790033ae6_NP-126-42.png"
            alt="app store"
          />

          <img
            className="w-40"
            src="https://www.vhv.rs/dpng/d/114-1147665_transparent-google-play-icon-png-android-available-on.png"
            alt="play store"
          />
        </div>
      </div>

      {/* ================= PAYMENT SECTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 border-b bg-white">

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Payment Methods</h3>
          <div className="flex flex-wrap gap-3">
            <img className="h-8" src="https://img.lazcdn.com/us/domino/c2458806-20cd-491a-a688-b401834ea19c_NP-139-84.png" />
            <img className="h-8" src="https://img.lazcdn.com/us/domino/a6e969c7-243f-4323-8ad1-64599aeb52af_NP-117-70.png" />
            <img className="h-8" src="https://img.lazcdn.com/us/domino/9ec5c353-cd15-400b-b2b4-8b7182fe76e7_NP-63-48.png" />
            <img className="h-8" src="https://img.lazcdn.com/us/domino/9a39944c-1987-458d-8199-3a6c821bcdec_NP-144-84.png" />
          </div>
        </div>

        {/* Verified */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Verified By</h3>
          <img
            className="h-10"
            src="//img.drz.lazcdn.com/g/tps/imgextra/i4/O1CN01ZaMORP1I3qlBom0V2_!!6000000000838-2-tps-73-41.png"
            alt=""
          />
        </div>
      </div>

      {/* ================= BOTTOM DESCRIPTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 text-xs text-gray-600">

        <div>
          <h2 className="font-bold text-gray-800 mb-2">Online Shopping in Nepal</h2>
          <p>
            Daraz is Nepal’s leading online shopping marketplace with millions of products
            across multiple categories including fashion, electronics, home appliances, and more.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-gray-800 mb-2">Trending Searches</h2>
          <p>
            Mobile Sale, Flash Deals, 11.11 Sale, Dashain Offer, Electronics Discount,
            Grocery Delivery, Fashion Deals
          </p>
        </div>

        <div>
          <h2 className="font-bold text-gray-800 mb-2">Contact</h2>
          <p>Email: support@daraz.com</p>
          <p>Phone: 01-5970597</p>
          <p>Kathmandu, Nepal</p>
        </div>
      </div>

      {/* ================= FINAL BAR ================= */}
      <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-200 text-xs">

        <div className="flex gap-3 flex-wrap">
          <span>Pakistan</span>
          <span>|</span>
          <span>Bangladesh</span>
          <span>|</span>
          <span>Sri Lanka</span>
          <span>|</span>
          <span>Myanmar</span>
          <span>|</span>
          <span>Nepal</span>
        </div>

        <div className="flex gap-3 mt-2 md:mt-0">
          <img className="w-5" src="https://img.lazcdn.com/g/tps/imgextra/i3/O1CN01Wdetn224xMIRNihao_!!6000000007457-2-tps-34-34.png" />
          <img className="w-5" src="https://img.lazcdn.com/us/domino/cc9e593f-adae-428c-abae-e55953feea31_BD-76-76.png" />
          <img className="w-5" src="https://img.lazcdn.com/us/domino/f65e9f63-e19e-4fa6-bdfd-35158b2e21d8_BD-76-76.png" />
        </div>

        <div>© Daraz 2026</div>
      </div>

    </footer>
  );
};

export default Footer;