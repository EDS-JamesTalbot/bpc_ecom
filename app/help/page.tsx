import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Owner Guide | Help Center",
  description: "Complete guide for managing your e-commerce website - add products, upload images, and manage your online store.",
};

// Note: Authentication disabled due to Clerk JWT infinite loop issue
// The Help link is only visible to admins in the Navigation component
export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-[#0c4a6e] mb-4">
            Website Owner Guide
          </h1>
          <p className="text-xl text-[#475569]">
            Everything you need to manage your e-commerce website
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-12">
          
          {/* Table of Contents */}
          <nav className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-6 border-2 border-primary/20">
            <h2 className="text-2xl font-bold text-[#0c4a6e] mb-4">📋 Table of Contents</h2>
            <ul className="space-y-2 text-[#0c4a6e]">
              <li><a href="#getting-started" className="hover:text-primary hover:underline">🚀 Getting Started (Signing In & Accessing Admin Features)</a></li>
              <li><a href="#managing-products" className="hover:text-primary hover:underline">📦 Managing Products (Shop)</a></li>
              <li><a href="#other-content" className="hover:text-primary hover:underline">📝 Managing Other Website Content</a></li>
              <li><a href="#sales-dashboard" className="hover:text-primary hover:underline">📊 Sales Dashboard</a></li>
              <li><a href="#theme-editor" className="hover:text-primary hover:underline">🎨 Theme Editor (Colours & Fonts)</a></li>
              <li><a href="#customer-crm" className="hover:text-primary hover:underline">👥 Customer CRM & Account Management</a></li>
              <li><a href="#working-with-images" className="hover:text-primary hover:underline">🖼️ Working with Images</a></li>
              <li><a href="#product-visibility" className="hover:text-primary hover:underline">👁️ Product Visibility</a></li>
              <li><a href="#understanding-services" className="hover:text-primary hover:underline">🔧 Understanding Your Services (Clerk, BPC, etc.)</a></li>
              <li><a href="#security" className="hover:text-primary hover:underline">🔒 Security & Safety</a></li>
              <li><a href="#quick-reference" className="hover:text-primary hover:underline">📖 Quick Reference Guide</a></li>
              <li><a href="#troubleshooting" className="hover:text-primary hover:underline">🔧 Troubleshooting Common Issues</a></li>
            </ul>
          </nav>

          {/* Getting Started */}
          <section id="getting-started">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-6 border-b-2 border-primary pb-2">
              🚀 Getting Started
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Signing In</h3>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4">
                  <li>Visit any page on your website</li>
                  <li>Click the <strong>Admin Login</strong> button in the top-right corner</li>
                  <li>Sign in with your admin account credentials</li>
                  <li>Once signed in, you will see an <strong>Admin</strong> badge next to your profile picture</li>
                </ol>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-primary">
                  <p className="text-sm text-[#0c4a6e]">
                    <strong>Note:</strong> Your developer has set up your admin account using a service called <strong>Clerk</strong> (more on this below).
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Accessing Admin Features</h3>
                <p className="text-[#475569] mb-3">
                  When signed in as an admin, you will see three new menu options in the navigation bar:
                </p>
                <ul className="space-y-3 text-[#475569] ml-4">
                  <li>
                    <strong className="text-[#0c4a6e]">📄 Content</strong> - Opens the Content Management Dashboard where you can manage:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Shop</strong> - Add, edit, and manage products</li>
                      <li><strong>Testimonials</strong> - Manage customer reviews</li>
                      <li><strong>Page Sections</strong> - Edit content for home, contact, and other pages</li>
                      <li><strong>Site Settings</strong> - Update contact info and site-wide settings (including store logo)</li>
                      <li><strong>Theme Editor</strong> - Change colours and fonts (no coding)</li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-[#0c4a6e]">📊 Sales</strong> - Opens the Sales Dashboard with product sales summary, top customers, sales trends, and best/worst selling products
                  </li>
                  <li>
                    <strong className="text-[#0c4a6e]">❓ Help</strong> - This documentation page you're reading now
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-green-900">
                    <strong>💡 Tip:</strong> Regular customers will not see the "Content", "Sales", and "Help" menu options - they're only visible to admin users!
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Using the Content Management Dashboard</h3>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4">
                  <li>Click the <strong>Content</strong> menu option in the navigation bar</li>
                  <li>You'll see a dashboard with six main sections (cards): Shop, Testimonials, Page Sections, Site Settings, Sales, and Theme Editor</li>
                  <li>Click the <strong>Manage</strong> or <strong>View</strong> button on any card to access that section</li>
                  <li>Each section has its own interface tailored to that content type</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Managing Products */}
          <section id="managing-products">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-6 border-b-2 border-primary pb-2">
              📦 Managing Products
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Accessing the Shop Manager</h3>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4">
                  <li>Click <strong>Content</strong> in the navigation menu</li>
                  <li>On the Content Management Dashboard, click <strong>Manage Products</strong> on the Shop card</li>
                  <li>You'll be taken to the Shop page where you can add, edit, and manage products</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Adding a New Product</h3>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4">
                  <li><strong>Click</strong> the <strong>Add New Product</strong> card (has a big plus icon)</li>
                  <li>A dialog box will open where you can enter:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Product Name</strong> - The name customers will see</li>
                      <li><strong>Product Image</strong> - See Working with Images section</li>
                      <li><strong>Description</strong> - Details about the product</li>
                      <li><strong>Price</strong> - Price per item (e.g., 25.99)</li>
                      <li><strong>Product Status</strong> - Toggle between Active or Inactive</li>
                    </ul>
                  </li>
                  <li><strong>Click Create Product</strong> to save</li>
                </ol>
                <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-green-900">
                    Your new product will appear immediately on the shop page!
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Editing an Existing Product</h3>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4">
                  <li><strong>Find the product</strong> you want to edit on the shop page</li>
                  <li><strong>Click the Edit</strong> button on that product card</li>
                  <li>The same dialog will open with all current information filled in</li>
                  <li><strong>Make your changes</strong> to any field</li>
                  <li><strong>Click Save Changes</strong></li>
                </ol>
                <p className="mt-3 text-[#475569]">All changes take effect immediately!</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Deleting a Product</h3>
                <div className="mb-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm text-red-900">
                    <strong>⚠️ Important:</strong> Deleting a product is permanent and cannot be undone!
                  </p>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4">
                  <li><strong>Click the trash icon (🗑️)</strong> on the product you want to delete</li>
                  <li>A confirmation dialog will appear showing the product name</li>
                  <li><strong>Click Delete Product</strong> to confirm, or <strong>Cancel</strong> to keep it</li>
                </ol>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-primary">
                  <p className="text-sm text-[#0c4a6e]">
                    <strong>Tip:</strong> Instead of deleting, consider using the Inactive status to hide products temporarily.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Managing Other Website Content */}
          <section id="other-content">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-6 border-b-2 border-primary pb-2">
              📝 Managing Other Website Content
            </h2>
            
            <div className="space-y-6">
              <p className="text-[#475569]">
                Beyond managing products, the Content Management Dashboard gives you access to Testimonials, Page Sections, Site Settings, and the Theme Editor:
              </p>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">💬 Testimonials</h3>
                <p className="text-[#475569] mb-3">
                  Manage customer reviews and testimonials displayed on your website.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4">
                  <li>Click <strong>Content</strong> in the navigation menu</li>
                  <li>Click <strong>Manage Testimonials</strong> on the Testimonials card</li>
                  <li>Use the interface to add, edit, or toggle testimonials active/inactive</li>
                </ol>
                <div className="mt-3 p-4 bg-blue-50 rounded-lg border-l-4 border-primary">
                  <p className="text-sm text-[#0c4a6e]">
                    <strong>💡 Tip:</strong> Testimonials set to "Inactive" won't show on your website but remain saved in case you want to reactivate them later.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">📄 Page Sections</h3>
                <p className="text-[#475569] mb-3">
                  Edit content sections for your home page, testimonials page, contact page, and other pages throughout your site.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4">
                  <li>Click <strong>Content</strong> in the navigation menu</li>
                  <li>Click <strong>Manage Page Sections</strong> on the Page Sections card</li>
                  <li>Each section has editable fields for titles, descriptions, and other content</li>
                  <li>Content is stored as JSON for flexibility and easy editing</li>
                </ol>
                <div className="mt-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-green-900">
                    <strong>🎨 Design Tip:</strong> Page Sections let you customize your website's text and messaging without touching any code!
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">⚙️ Site Settings</h3>
                <p className="text-[#475569] mb-3">
                  Update global settings like contact information, social media links, and other site-wide information.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4">
                  <li>Click <strong>Content</strong> in the navigation menu</li>
                  <li>Click <strong>Manage Settings</strong> on the Site Settings card</li>
                  <li>Update settings like email addresses, phone numbers, business hours, etc.</li>
                  <li>These settings are used throughout your website automatically</li>
                </ol>
                <div className="mt-3 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="text-sm text-purple-900">
                    <strong>🔗 Consistency:</strong> Updating contact info in Site Settings automatically updates it everywhere on your website!
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">🖼️ Store logo (Site Settings)</h3>
                <p className="text-[#475569] mb-3">
                  Your store logo is managed in Site Settings under the <strong>Branding</strong> category. Click <strong>Edit</strong> on <strong>store_logo</strong> to upload an image or paste a URL. Leave it empty to show the text &quot;LOGO&quot; in the header.
                </p>
              </div>
            </div>
          </section>

          {/* Sales Dashboard */}
          <section id="sales-dashboard">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-6 border-b-2 border-primary pb-2">
              📊 Sales Dashboard
            </h2>
            
            <div className="space-y-6">
              <p className="text-[#475569]">
                The Sales Dashboard gives you a clear overview of your store&apos;s performance. Access it by clicking <strong>Sales</strong> in the navigation menu, or by clicking <strong>View Sales</strong> on the Sales card from the Content Management Dashboard.
              </p>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Product Sales Summary Table</h3>
                <p className="text-[#475569] mb-3">
                  A clean table listing all your products with:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[#475569] ml-4">
                  <li><strong>Product name</strong> and current price</li>
                  <li><strong>Quantity sold</strong> (total units from paid orders)</li>
                  <li><strong>Total value</strong> (revenue from that product)</li>
                  <li><strong>Status</strong> (Active or Inactive)</li>
                </ul>
                <p className="mt-3 text-[#475569]">A totals row at the bottom shows your overall quantity and revenue. All figures are based on <strong>paid orders only</strong>.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Top 5 Customers</h3>
                <p className="text-[#475569] mb-3">
                  See your best customers ranked by total amount spent. This includes:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[#475569] ml-4">
                  <li><strong>Registered customers</strong> (those with an account)</li>
                  <li><strong>Guest customers</strong> (those who checked out without creating an account)</li>
                </ul>
                <p className="mt-3 text-[#475569]">Each entry shows name, email (if available), total spent, and number of orders.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Sales Trend Chart</h3>
                <p className="text-[#475569] mb-3">
                  A bar chart showing your sales over the last 12 months:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[#475569] ml-4">
                  <li><strong>Green bars</strong> – Monthly sales totals (matching the green dollar values on the axis)</li>
                  <li><strong>Dashed trendline</strong> – Linear trend showing whether sales are going up or down over time</li>
                </ul>
                <p className="mt-3 text-[#475569]">Hover over any bar to see the exact amount. The trendline helps you spot growth or decline at a glance.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Top 5 &amp; Worst 5 Selling Products</h3>
                <p className="text-[#475569] mb-3">
                  Two lists to help you understand product performance:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[#475569] ml-4">
                  <li><strong>Top 5 Selling Products</strong> – Products with the highest quantity sold</li>
                  <li><strong>Worst 5 Selling Products</strong> – Products with the lowest quantity sold (including products with zero sales)</li>
                </ul>
                <p className="mt-3 text-[#475569]">Use these to spot your bestsellers and products that may need promotion or reconsideration.</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-[#0c4a6e]">
                  <strong>Note:</strong> The cart button in the navigation bar has been repositioned slightly to the right for better layout. All sales data is calculated from paid orders only.
                </p>
              </div>
            </div>
          </section>

          {/* Theme Editor (Colours & Fonts) */}
          <section id="theme-editor">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-6 border-b-2 border-primary pb-2">
              🎨 Theme Editor (Colours & Fonts)
            </h2>
            <p className="text-[#475569] mb-6">
              The Theme Editor lets you change how your site looks without any coding. You can change colours (webpage background, header bar, buttons, text, and more) and choose fonts for buttons, menus, and product cards.
            </p>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">How to open the Theme Editor</h3>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4">
                  <li>Click <strong>Content</strong> in the navigation menu</li>
                  <li>On the Content Management Dashboard, click <strong>Edit Theme</strong> on the Theme Editor card (purple card)</li>
                </ol>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Colours you can change</h3>
                <ul className="list-disc list-inside space-y-1 text-[#475569] ml-4">
                  <li><strong>Webpage background</strong> – main area behind all content</li>
                  <li><strong>Header bar background</strong> – top bar on every page</li>
                  <li><strong>Main brand colours</strong> – buttons, links, secondary and accent colours</li>
                  <li><strong>Page and card colours</strong> – text and card backgrounds</li>
                  <li><strong>Softer colours</strong> – muted text and tagline</li>
                  <li><strong>Borders and boxes</strong> – borders, input fields, dropdowns</li>
                  <li><strong>Corner roundness</strong> – how rounded buttons and cards are</li>
                </ul>
                <p className="mt-3 text-[#475569]">Use the colour box to pick a colour, or type a hex code (e.g. #1DA1F9). Click <strong>Save Changes</strong> to apply; the page will refresh with your new theme.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Fonts you can change</h3>
                <p className="text-[#475569] mb-2">
                  In the <strong>Fonts</strong> section you can choose the font for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[#475569] ml-4">
                  <li><strong>Buttons</strong> – all button text across the site</li>
                  <li><strong>Menus and navigation</strong> – the main nav links (Home, Shop, Contact, etc.)</li>
                  <li><strong>Product cards (shop)</strong> – product names, descriptions, and prices on the shop page</li>
                </ul>
                <p className="mt-3 text-[#475569]">Choose from options like Default (site font), Arial, Georgia, Times New Roman, System default, Verdana, and Trebuchet MS. No coding required.</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <p className="text-sm text-amber-900">
                  <strong>Reset to Defaults:</strong> If you don’t like your changes, click <strong>Reset to Defaults</strong> to restore all colours and fonts to the original theme.
                </p>
              </div>
            </div>
          </section>

          {/* Customer CRM */}
          <section id="customer-crm">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-6 border-b-2 border-primary pb-2">
              👥 Customer CRM & Account Management
            </h2>
            
            <div className="space-y-6">
              <p className="text-[#475569]">
                Your website now includes a complete <strong>Customer Relationship Management (CRM)</strong> system that allows customers to create accounts, track their orders, and enjoy a personalized shopping experience.
              </p>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Overview of Customer Features</h3>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-400/30">
                  <ul className="space-y-2 text-[#475569]">
                    <li>✅ <strong>Customer Registration</strong> - Create accounts during checkout</li>
                    <li>✅ <strong>Secure Login/Logout</strong> - Separate from admin login</li>
                    <li>✅ <strong>My Account Dashboard</strong> - View orders, edit profile, manage preferences</li>
                    <li>✅ <strong>Order History</strong> - Track all past purchases with order details</li>
                    <li>✅ <strong>Sales Analytics</strong> - Visual graphs showing spending trends</li>
                    <li>✅ <strong>Pre-filled Checkout</strong> - Saved information for faster future purchases</li>
                    <li>✅ <strong>Newsletter Management</strong> - Subscribe/unsubscribe with one click</li>
                    <li>✅ <strong>Account Deletion</strong> - Customers can delete their own accounts</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Customer Registration (During Checkout)</h3>
                <p className="text-[#475569] mb-3">
                  Customers can create an account while checking out their first purchase:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4">
                  <li>Customer adds products to cart and proceeds to checkout</li>
                  <li>They fill in their contact information (name, phone, email)</li>
                  <li>Below the contact form, they see a checkbox: <strong>"Create an account to track your orders"</strong></li>
                  <li>When checked, additional fields appear:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Password</strong> (required, minimum 8 characters)</li>
                      <li><strong>Confirm Password</strong> (required, must match)</li>
                      <li><strong>Date of Birth</strong> (optional)</li>
                      <li><strong>Gender</strong> (optional dropdown)</li>
                    </ul>
                  </li>
                  <li>Customer completes their purchase and their account is created automatically</li>
                  <li>They can immediately access their account using the <strong>"Customer Sign in"</strong> button</li>
                </ol>
                <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-green-900">
                    <strong>💡 Benefit:</strong> Customers can track their orders without needing a separate registration process!
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Customer Sign In & Sign Out</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-[#475569] mb-2"><strong>Signing In:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-[#475569] ml-4">
                      <li>Customer clicks the <strong>"Customer Sign in"</strong> button (far left of navigation bar)</li>
                      <li>A modal opens where they enter their email and password</li>
                      <li>Upon successful login, the button changes to <strong>"My Account"</strong></li>
                      <li>A <strong>"Sign Out"</strong> button appears next to it</li>
                    </ol>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-2"><strong>Signing Out:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-[#475569] ml-4">
                      <li>Customer clicks the red <strong>"Sign Out"</strong> button in the navigation bar</li>
                      <li>They are immediately logged out and redirected to the home page</li>
                      <li>The navigation returns to showing <strong>"Customer Sign in"</strong></li>
                    </ol>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-primary">
                  <p className="text-sm text-[#0c4a6e]">
                    <strong>Note:</strong> Customer accounts are completely separate from your admin account. Customer login is NOT the same as admin login.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">My Account Dashboard</h3>
                <p className="text-[#475569] mb-3">
                  When logged in, customers can click <strong>"My Account"</strong> to access their personalized dashboard with four main sections:
                </p>

                <div className="space-y-4">
                  {/* Profile Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-5 border-2 border-primary/30">
                    <h4 className="text-lg font-semibold text-[#0c4a6e] mb-3">📋 Profile</h4>
                    <p className="text-[#475569] mb-2">Displays and allows editing of:</p>
                    <ul className="space-y-1 text-[#475569] ml-4">
                      <li>• <strong>Full Name</strong></li>
                      <li>• <strong>Email Address</strong></li>
                      <li>• <strong>Phone Number</strong></li>
                      <li>• <strong>Date of Birth</strong></li>
                      <li>• <strong>Gender</strong></li>
                      <li>• <strong>Member Since</strong> date (read-only)</li>
                    </ul>
                    <p className="text-sm text-[#475569] mt-3">
                      <strong>To Edit:</strong> Click the "Edit" button → Make changes → Click "Save" or "Cancel"
                    </p>
                  </div>

                  {/* Order Statistics Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-400/30">
                    <h4 className="text-lg font-semibold text-[#0c4a6e] mb-3">📊 Order Statistics</h4>
                    <p className="text-[#475569] mb-2">Shows customer's shopping activity:</p>
                    <ul className="space-y-1 text-[#475569] ml-4">
                      <li>• <strong>Completed Orders</strong> - Total number of paid orders</li>
                      <li>• <strong>Total Spent</strong> - Lifetime spending amount</li>
                      <li>• <strong>Sales Trend Graph</strong> - Visual line chart showing spending over the last 6 months</li>
                    </ul>
                    <p className="text-sm text-[#475569] mt-3">
                      The sales trend graph updates automatically as customers make new purchases.
                    </p>
                  </div>

                  {/* Preferences Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-400/30">
                    <h4 className="text-lg font-semibold text-[#0c4a6e] mb-3">⚙️ Preferences</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[#475569] font-semibold mb-1">Newsletter Subscription</p>
                        <p className="text-sm text-[#475569]">
                          • Toggle switch to subscribe/unsubscribe from marketing emails<br/>
                          • Changes take effect immediately
                        </p>
                      </div>
                      <div>
                        <p className="text-[#475569] font-semibold mb-1">Default Shipping Address</p>
                        <p className="text-sm text-[#475569] mb-2">
                          • Stores customer's preferred shipping address for faster checkout<br/>
                          • Includes: Street Address, Suburb/Region, and Country (dropdown with all countries)
                        </p>
                        <p className="text-sm text-[#475569]">
                          <strong>To Edit:</strong> Click "Edit" → Update fields → Click "Save" or "Cancel"
                        </p>
                      </div>
                      <div>
                        <p className="text-[#475569] font-semibold mb-1">Delete Account</p>
                        <p className="text-sm text-[#475569]">
                          • Red "Delete Account" button at the bottom<br/>
                          • Opens a confirmation modal warning that deletion is permanent<br/>
                          • Deletes all customer data and order history
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order History Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-400/30">
                    <h4 className="text-lg font-semibold text-[#0c4a6e] mb-3">📦 Order History</h4>
                    <p className="text-[#475569] mb-2">Complete list of all customer orders showing:</p>
                    <ul className="space-y-1 text-[#475569] ml-4">
                      <li>• <strong>Order Number</strong> (e.g., Order #14)</li>
                      <li>• <strong>Order Date</strong></li>
                      <li>• <strong>Product Details</strong> - Product name, product code (#), quantity on same line</li>
                      <li>• <strong>Total Price</strong></li>
                      <li>• <strong>Status Badge</strong> - Color-coded (green for "Paid", gray for "Pending", red for "Failed")</li>
                    </ul>
                    <p className="text-sm text-[#475569] mt-3">
                      Orders are displayed from newest to oldest for easy tracking.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Pre-filled Checkout for Logged-In Customers</h3>
                <p className="text-[#475569] mb-3">
                  One of the biggest benefits of customer accounts:
                </p>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-400/30">
                  <h4 className="font-semibold text-green-900 mb-2">When a logged-in customer goes to checkout:</h4>
                  <ul className="space-y-2 text-[#475569]">
                    <li>✅ <strong>All contact information is automatically filled</strong> (name, email, phone)</li>
                    <li>✅ <strong>Shipping address is pre-populated</strong> with their saved default address</li>
                    <li>✅ <strong>"Create Account" option is hidden</strong> (they already have one)</li>
                    <li>✅ <strong>Green confirmation badge</strong> shows "Signed in - Your information has been pre-filled"</li>
                    <li>✅ <strong>All orders are automatically linked</strong> to their account for tracking</li>
                  </ul>
                  <p className="text-sm text-green-900 mt-4">
                    <strong>Result:</strong> Checkout is faster and easier, leading to more completed purchases!
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Viewing Customer Data (Admin)</h3>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                  <p className="text-sm text-yellow-900 mb-2">
                    <strong>⚠️ Important:</strong> Customer account data is stored in your Neon database in a separate <code>customers</code> table.
                  </p>
                  <p className="text-sm text-yellow-900 mb-2">
                    To view customer information, analytics, or export customer data, you will need to:
                  </p>
                  <ol className="text-sm text-yellow-900 space-y-1 ml-4 list-decimal list-inside">
                    <li>Access your Neon Database Dashboard (contact your developer for access)</li>
                    <li>Run SQL queries to view customer records</li>
                    <li>Or ask your developer to create a custom admin CRM dashboard</li>
                  </ol>
                  <p className="text-sm text-yellow-900 mt-2">
                    <strong>Privacy Note:</strong> Customer passwords are securely hashed and cannot be viewed by anyone, including administrators.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Working with Images */}
          <section id="working-with-images">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-6 border-b-2 border-primary pb-2">
              🖼️ Working with Images
            </h2>
            
            <p className="text-[#475569] mb-6">
              When adding or editing a product, you have <strong>5 different ways</strong> to add images. Choose the method that works best for you!
            </p>

            <div className="space-y-6">
              {/* Method 1: URL */}
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-6 border-2 border-primary/30">
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">
                  Method 1: URL (Paste a Link) ⭐ Easiest
                </h3>
                <p className="text-[#475569] mb-3"><strong>Best for:</strong> Using images from anywhere on the internet</p>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4 mb-3">
                  <li>Select the <strong>URL</strong> tab</li>
                  <li>Copy an image link from another website</li>
                  <li>Paste it into the text field</li>
                  <li>Click <strong>Add</strong></li>
                </ol>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-3 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <span>⚠️</span> Important: Image Copyright & Licensing
                  </h4>
                  <p className="text-sm text-yellow-900 mb-2">
                    <strong>Only use images you have legal rights to use!</strong> Not all images on the internet are free to use for commercial purposes.
                  </p>
                  <div className="space-y-2 text-sm text-yellow-900">
                    <div>
                      <p className="font-semibold text-green-700 mb-1">✅ Safe to use (Free & Open Source):</p>
                      <ul className="ml-4 space-y-1">
                        <li>• <strong>Unsplash.com</strong> - Free high-quality photos</li>
                        <li>• <strong>Pexels.com</strong> - Free stock photos & videos</li>
                        <li>• <strong>Pixabay.com</strong> - Free images and illustrations</li>
                        <li>• Your own photos or images you created</li>
                        <li>• Images you have purchased or licensed</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-red-700 mb-1">❌ NOT safe to use (Protected/Copyrighted):</p>
                      <ul className="ml-4 space-y-1">
                        <li>• Images from Google Search (often copyrighted)</li>
                        <li>• Photos from other business websites</li>
                        <li>• Stock photos you have not paid for</li>
                        <li>• Social media photos you do not own</li>
                        <li>• Images with watermarks or © symbols</li>
                      </ul>
                    </div>
                    <p className="mt-2 font-semibold">
                      Using copyrighted images without permission can result in legal action and fines.
                    </p>
                  </div>
                </div>
              </div>

              {/* Method 2: Browse Cloudinary */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-400/30">
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">
                  Method 2: Browse Cloudinary ⭐ Recommended
                </h3>
                <p className="text-[#475569] mb-3"><strong>Best for:</strong> Reusing images you have already uploaded</p>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4 mb-3">
                  <li>Select the <strong>Browse</strong> tab</li>
                  <li>Click <strong>Browse Cloudinary Images</strong></li>
                  <li>Wait for your image library to load</li>
                  <li>Click on any image to select it</li>
                </ol>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-3 rounded-lg">
                  <h4 className="font-semibold text-[#0c4a6e] mb-2 flex items-center gap-2">
                    <span>ℹ️</span> Your Cloudinary Library
                  </h4>
                  <p className="text-sm text-[#475569] mb-2">
                    Your developer has set up a <strong>Free Cloudinary account</strong> for your website with:
                  </p>
                  <ul className="text-sm text-[#475569] space-y-1 ml-4 mb-2">
                    <li>• <strong>25 GB storage</strong> (~5,000-10,000 images)</li>
                    <li>• <strong>25 GB monthly bandwidth</strong></li>
                    <li>• <strong>Global CDN delivery</strong> for fast loading</li>
                  </ul>
                  <p className="text-sm text-[#475569]">
                    All images you upload via Method 3 will appear here for easy reuse across products.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-green-900">
                    <strong>💡 Tip:</strong> This is the fastest way to add images you have used before!
                  </p>
                </div>
              </div>

              {/* Method 3: Upload to Cloudinary */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-400/30">
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">
                  Method 3: Upload to Cloudinary ⭐ Best Quality
                </h3>
                <p className="text-[#475569] mb-3"><strong>Best for:</strong> New images that need to load fast for customers</p>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4 mb-3">
                  <li>Select the <strong>Upload</strong> tab</li>
                  <li>Click the upload area</li>
                  <li>Choose an image from your computer (up to 10MB)</li>
                  <li>Wait for the upload to complete</li>
                </ol>
                
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-[#475569] mb-2"><strong>Why use this?</strong></p>
                  <ul className="text-sm text-[#475569] space-y-1 ml-4">
                    <li>✓ Images stored on a fast content delivery network (CDN)</li>
                    <li>✓ Customers see images load quickly anywhere in the world</li>
                    <li>✓ Automatic optimization for web performance</li>
                  </ul>
                </div>
              </div>

              {/* Method 4: Server Upload */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-400/30">
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">
                  Method 4: Server Upload
                </h3>
                <p className="text-[#475569] mb-3"><strong>Best for:</strong> Storing images directly on your website server</p>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4 mb-3">
                  <li>Select the <strong>Server</strong> tab</li>
                  <li>Click the upload area</li>
                  <li>Choose an image from your computer (up to 10MB)</li>
                  <li>Wait for the upload to complete</li>
                </ol>
                
                <div className="bg-white p-4 rounded-lg mb-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">✅ Pros:</h4>
                      <ul className="text-sm text-[#475569] space-y-1 ml-4">
                        <li>• Simple and straightforward</li>
                        <li>• Full control over your images</li>
                        <li>• No third-party dependency</li>
                        <li>• No account limits or bandwidth restrictions</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">❌ Cons:</h4>
                      <ul className="text-sm text-[#475569] space-y-1 ml-4">
                        <li>• Slower loading for distant customers</li>
                        <li>• No automatic CDN optimization</li>
                        <li>• Uses your server storage space</li>
                        <li>• May slow down if many users browse at once</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    <strong>💡 Recommendation:</strong> Use Cloudinary (Method 3) for better performance unless you have specific reasons to store images on your server.
                  </p>
                </div>
              </div>

              {/* Method 5: Embed in Database */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border-2 border-gray-400/30">
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">
                  Method 5: Embed in Database
                </h3>
                <p className="text-[#475569] mb-3"><strong>Best for:</strong> Small images or icons</p>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4 mb-3">
                  <li>Select the <strong>Embed</strong> tab</li>
                  <li>Click the upload area</li>
                  <li>Choose a small image from your computer (up to 2MB recommended)</li>
                  <li>Wait for processing to complete</li>
                </ol>
                
                <div className="bg-white p-4 rounded-lg mb-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">✅ Pros:</h4>
                      <ul className="text-sm text-[#475569] space-y-1 ml-4">
                        <li>• No upload process required</li>
                        <li>• Image is always with the product data</li>
                        <li>• Works instantly (no external dependencies)</li>
                        <li>• Included in database backups</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">❌ Cons:</h4>
                      <ul className="text-sm text-[#475569] space-y-1 ml-4">
                        <li>• Only suitable for small images (under 2MB)</li>
                        <li>• Bloats your database size</li>
                        <li>• Slower page loading with many products</li>
                        <li>• Not recommended for product photos</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
                  <p className="text-sm text-red-900">
                    <strong>⚠️ Warning:</strong> Only use this method for small icons or logos. For product photos, use Cloudinary (Method 3) or Server Upload (Method 4) instead.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Product Visibility */}
          <section id="product-visibility">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-6 border-b-2 border-primary pb-2">
              👁️ Product Visibility
            </h2>
            
            <p className="text-[#475569] mb-6">Every product has two states:</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-400/30">
                <h3 className="text-xl font-semibold text-green-700 mb-3">
                  Active (Visible to Customers)
                </h3>
                <ul className="space-y-2 text-[#475569]">
                  <li>✅ Product appears on the shop page</li>
                  <li>✅ Customers can add it to cart and purchase</li>
                  <li>✅ Green Active label in admin view</li>
                </ul>
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-sm text-green-900">
                    <strong>Use when:</strong> Product is ready to sell
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border-2 border-gray-400/30">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Inactive (Hidden from Customers)
                </h3>
                <ul className="space-y-2 text-[#475569]">
                  <li>🔒 Product is hidden from the shop page</li>
                  <li>🔒 Only you (admin) can see it</li>
                  <li>🔒 Gray Not Active label in admin view</li>
                </ul>
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-900 mb-2">
                    <strong>Use when:</strong>
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li>• Product is out of stock temporarily</li>
                    <li>• Still setting up product details</li>
                    <li>• Product will be available soon</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-[#0c4a6e] mb-3">Changing Product Status</h3>
              <ol className="list-decimal list-inside space-y-2 text-[#475569] ml-4">
                <li>Click <strong>Edit</strong> on any product</li>
                <li>Find the <strong>toggle switch</strong> at the bottom of the form</li>
                <li>Switch it on (Active) or off (Inactive)</li>
                <li>Click <strong>Save Changes</strong></li>
              </ol>
            </div>
          </section>

          {/* Quick Reference */}
          <section id="quick-reference">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-6 border-b-2 border-primary pb-2">
              📖 Quick Reference
            </h2>
            
            <div className="space-y-6">
              {/* Common Tasks Table */}
              <div>
                <h3 className="text-xl font-semibold text-[#0c4a6e] mb-4">Common Tasks</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                    <thead className="bg-[#1DA1F9] text-white">
                      <tr>
                        <th className="p-3 text-left">Task</th>
                        <th className="p-3 text-left">Steps</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-semibold">Access admin features</td>
                        <td className="p-3">Sign in as admin → Click "Content" in navigation menu</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-semibold">Manage products</td>
                        <td className="p-3">Content menu → Manage Products button on Shop card</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-semibold">Add product</td>
                        <td className="p-3">Go to Shop → Click Add New Product → Fill form → Click Create Product</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-semibold">Edit product</td>
                        <td className="p-3">Click Edit on product → Make changes → Click Save Changes</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-semibold">Delete product</td>
                        <td className="p-3">Click trash icon (🗑️) → Confirm deletion</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-semibold">Hide product</td>
                        <td className="p-3">Edit product → Toggle switch to Inactive → Save</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-semibold">Manage testimonials</td>
                        <td className="p-3">Content menu → Manage Testimonials button</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-semibold">Edit page content</td>
                        <td className="p-3">Content menu → Manage Page Sections button</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-semibold">Update site settings</td>
                        <td className="p-3">Content menu → Manage Settings button</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-semibold">View sales dashboard</td>
                        <td className="p-3">Click Sales in navigation menu, or Content → View Sales</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-semibold">View product sales summary</td>
                        <td className="p-3">Sales menu → Product Sales Summary table</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="p-3 font-semibold">View top customers</td>
                        <td className="p-3">Sales menu → Top 5 Customers section</td>
                      </tr>
                      <tr className="hover:bg-blue-50 bg-purple-50">
                        <td className="p-3 font-semibold">Customer sign in</td>
                        <td className="p-3">Click "Customer Sign in" (far left of nav) → Enter email/password</td>
                      </tr>
                      <tr className="hover:bg-blue-50 bg-purple-50">
                        <td className="p-3 font-semibold">View customer account</td>
                        <td className="p-3">Sign in → Click "My Account" button</td>
                      </tr>
                      <tr className="hover:bg-blue-50 bg-purple-50">
                        <td className="p-3 font-semibold">Edit customer profile</td>
                        <td className="p-3">My Account → Click "Edit" on Profile card → Make changes → Save</td>
                      </tr>
                      <tr className="hover:bg-blue-50 bg-purple-50">
                        <td className="p-3 font-semibold">View order history</td>
                        <td className="p-3">My Account → Scroll to Order History section</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-6 border-b-2 border-primary pb-2">
              🔧 Troubleshooting
            </h2>
            
            <div className="space-y-6">
              {/* Issue 1 */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  ❌ I do not see the "Content", "Sales", or "Help" menu options
                </h3>
                <p className="text-[#475569] mb-2">
                  <strong>Problem:</strong> You are not signed in as an admin, or your account does not have admin privileges.
                </p>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-green-900 mb-2"><strong>Solution:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-green-900 ml-2">
                    <li>Check if you see the Admin badge in the top-right corner</li>
                    <li>If not, click Admin Login and sign in</li>
                    <li>If you still do not see admin controls after signing in, contact your developer to verify your account has admin role</li>
                  </ol>
                </div>
              </div>

              {/* Issue 2 */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  ❌ My image will not upload
                </h3>
                <p className="text-[#475569] mb-2">
                  <strong>Problem:</strong> File size or format issues.
                </p>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-green-900 mb-2"><strong>Solution:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-green-900 ml-2">
                    <li>Check the file size:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li>Cloudinary/Server: Must be under 10MB</li>
                        <li>Embed: Must be under 2MB</li>
                      </ul>
                    </li>
                    <li>Check the file format: Use JPEG, PNG, GIF, or WEBP</li>
                    <li>Try a different upload method (URL method works with any image online)</li>
                    <li>Make sure the file is actually an image (not a document or video)</li>
                  </ol>
                </div>
              </div>

              {/* Issue 3 */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  ❌ Product is not showing on the shop page
                </h3>
                <p className="text-[#475569] mb-2">
                  <strong>Problem:</strong> Product is set to Inactive status.
                </p>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-green-900 mb-2"><strong>Solution:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-green-900 ml-2">
                    <li>Click Edit on the product</li>
                    <li>Look for the toggle switch at the bottom</li>
                    <li>Make sure it says Product Active (switch should be on/green)</li>
                    <li>Click Save Changes</li>
                  </ol>
                </div>
              </div>

              {/* Issue 4 */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  ❌ Customer cannot sign in / "Sign Out" button not showing
                </h3>
                <p className="text-[#475569] mb-2">
                  <strong>Problem:</strong> Authentication state not updating or browser caching issue.
                </p>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-green-900 mb-2"><strong>Solution:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-green-900 ml-2">
                    <li><strong>Hard refresh the page:</strong> Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)</li>
                    <li>Try signing out and signing back in</li>
                    <li>Clear browser cookies and cache, then try again</li>
                    <li>Try using a different browser or incognito/private window</li>
                    <li>If issue persists, contact your developer</li>
                  </ol>
                </div>
              </div>

              {/* Issue 5 */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  ❌ Customer accidentally logged into admin account
                </h3>
                <p className="text-[#475569] mb-2">
                  <strong>Problem:</strong> Customer used "Admin Login" button instead of "Customer Sign in" button.
                </p>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-green-900 mb-2"><strong>Solution:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-green-900 ml-2">
                    <li>Customer accounts and admin accounts are completely separate</li>
                    <li>Customers should use the <strong>"Customer Sign in"</strong> button (far left of navigation bar)</li>
                    <li>The <strong>"Admin Login"</strong> button is only for website administrators</li>
                    <li>If customer has an admin badge showing, they should sign out and use the correct button</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-8 border-t-2 border-gray-200">
            <h2 className="text-3xl font-bold text-[#0c4a6e] mb-4">
              🎉 You Are Ready!
            </h2>
            <p className="text-[#475569] mb-4">
              You now have everything you need to manage your e-commerce website. Remember:
            </p>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 max-w-3xl mx-auto">
              <ul className="text-left text-[#475569] space-y-2">
                <li>✅ <strong>Adding products</strong> is simple and takes just a minute</li>
                <li>✅ <strong>Sales Dashboard</strong> shows product summary, top customers, trends, and best/worst sellers</li>
                <li>✅ <strong>Multiple image upload methods</strong> give you flexibility</li>
                <li>✅ <strong>Inactive status</strong> lets you hide products temporarily</li>
                <li>✅ <strong>Security is built-in</strong> - your website is protected</li>
                <li>✅ <strong>Your developer is here</strong> to help with technical issues</li>
              </ul>
            </div>
            <p className="text-2xl font-bold text-[#0c4a6e] mt-6">
              Happy selling! 🚀
            </p>
            <p className="text-sm text-[#64748b] mt-6">
              Last Updated: March 2026 | Website Version: 2.1 (with Customer CRM &amp; Sales Dashboard)
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
