"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Download, Save, Mail, X, Menu } from "lucide-react";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomModal } from "@/components/ui/CustomModal";
import { CustomInput } from "@/components/ui/CustomInput";
import { emailTemplateService } from "../services/emailTemplateService";
import { cn } from "@/utils/cn";

// Import GrapesJS CSS
import "grapesjs/dist/css/grapes.min.css";

// Variables that can be inserted into email templates
// Using {{variable}} format to match API expectations
const variables = [
  { label: "User Name", key: "{{user.name}}" },
  { label: "Email", key: "{{user.email}}" },
  { label: "Order Number", key: "{{order.id}}" },
  { label: "Order Total", key: "{{order.total}}" },
  { label: "Order Date", key: "{{order.date}}" },
  { label: "Store Name", key: "{{store.name}}" },
  { label: "Product Name", key: "{{product.name}}" },
  { label: "Product Price", key: "{{product.price}}" },
  { label: "Customer Address", key: "{{customer.address}}" },
  { label: "Tracking Number", key: "{{order.trackingNumber}}" },
];

export function EmailTemplateBuilder({ templateId, initialData }) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [editorReady, setEditorReady] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [templateName, setTemplateName] = useState(initialData?.name || "");
  const [templateSubject, setTemplateSubject] = useState(
    initialData?.subject || ""
  );
  const [templateScope, setTemplateScope] = useState(
    initialData?.scope || "CUSTOM"
  );
  const [templateTrigger, setTemplateTrigger] = useState(
    initialData?.trigger || "manual"
  );
  const [testEmailData, setTestEmailData] = useState({ to: "", subject: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showVariablesSidebar, setShowVariablesSidebar] = useState(false);
  const [testUsers, setTestUsers] = useState([]);
  const [isLoadingTestUsers, setIsLoadingTestUsers] = useState(false);
  const [selectedTestUserId, setSelectedTestUserId] = useState("");

  // 👉 Remember the last caret/selection inside the GrapesJS iframe
  const lastSelectionRef = useRef(null);

  // Fetch test users when modal opens
  useEffect(() => {
    if (showTestEmailModal) {
      const fetchTestUsers = async () => {
        setIsLoadingTestUsers(true);
        try {
          const users = await emailTemplateService.getTestUsers();
          // Filter to only active users
          const activeUsers = users.filter((user) => user.isActive);
          setTestUsers(activeUsers);
        } catch (error) {
          console.error("Error fetching test users:", error);
          // Don't show error toast, just continue without test users
        } finally {
          setIsLoadingTestUsers(false);
        }
      };
      fetchTestUsers();
    }
  }, [showTestEmailModal]);

  // Handle test user selection
  useEffect(() => {
    if (selectedTestUserId) {
      const selectedUser = testUsers.find((u) => u.id === selectedTestUserId);
      if (selectedUser) {
        setTestEmailData((prev) => ({
          ...prev,
          to: selectedUser.email,
        }));
      }
    }
  }, [selectedTestUserId, testUsers]);

  // Initialize GrapesJS Editor
  useEffect(() => {
    if (!containerRef.current || editor) return;

    let editorInstance = null;
    let cleanupSelectionListeners = null;

    // Dynamically import GrapesJS to avoid SSR issues
    Promise.all([
      import("grapesjs"),
      import("grapesjs-preset-newsletter"),
    ]).then(([grapesjs, presetNewsletter]) => {
      editorInstance = grapesjs.default.init({
        container: containerRef.current,
        plugins: [presetNewsletter.default],
        pluginsOpts: {
          "gjs-preset-newsletter": {
            modalTitleImport: "Import template",
          },
        },
        height: "100%",
        width: "100%",
        storageManager: false, // We'll handle storage ourselves
        canvas: {
          styles: ["https://fonts.googleapis.com/css?family=Inter:400,600,700"],
        },
        // Set default styles for Rocky's design
        styleManager: {
          sectors: [
            {
              name: "Typography",
              open: false,
              buildProps: [
                "font-family",
                "font-size",
                "font-weight",
                "letter-spacing",
                "color",
                "line-height",
                "text-align",
              ],
              properties: [
                {
                  name: "Font Family",
                  property: "font-family",
                  type: "select",
                  defaults: "Inter, system-ui, sans-serif",
                  options: [
                    { value: "Inter, system-ui, sans-serif", name: "Inter" },
                    { value: "Arial, sans-serif", name: "Arial" },
                    { value: "Georgia, serif", name: "Georgia" },
                    {
                      value: "Times New Roman, serif",
                      name: "Times New Roman",
                    },
                  ],
                },
                {
                  name: "Text Color",
                  property: "color",
                  type: "color",
                  defaults: "#1d2327",
                },
              ],
            },
            {
              name: "Background",
              open: false,
              buildProps: ["background-color"],
              properties: [
                {
                  name: "Background Color",
                  property: "background-color",
                  type: "color",
                  defaults: "#F4F1EE",
                },
              ],
            },
          ],
        },
        // BlockManager will be handled by the preset-newsletter plugin
        // No need to configure it separately
      });

      // Set canvas background color using the correct GrapesJS API
      const setCanvasBackground = () => {
        try {
          const frameEl = editorInstance.Canvas.getFrameEl();
          if (frameEl) {
            const frameDoc =
              frameEl.contentDocument || frameEl.contentWindow?.document;
            if (frameDoc && frameDoc.body) {
              frameDoc.body.style.backgroundColor = "#F4F1EE";
            }
          }

          // Also set the canvas element background
          const canvasEl = editorInstance.Canvas.getElement();
          if (canvasEl) {
            canvasEl.style.backgroundColor = "#F4F1EE";
          }
        } catch (error) {
          console.error("Error setting canvas background:", error);
        }
      };

      // Canvas ready: set background + track caret/selection
      editorInstance.on("canvas:ready", () => {
        setCanvasBackground();

        const frameEl = editorInstance.Canvas.getFrameEl();
        if (!frameEl) return;

        const frameDoc =
          frameEl.contentDocument || frameEl.contentWindow?.document;
        if (!frameDoc) return;

        const saveSelection = () => {
          const sel = frameDoc.getSelection();
          if (!sel || sel.rangeCount === 0) {
            lastSelectionRef.current = null;
            return;
          }

          const range = sel.getRangeAt(0);

          let editableEl =
            range.commonAncestorContainer.nodeType === 3
              ? range.commonAncestorContainer.parentElement
              : range.commonAncestorContainer;

          // Walk up to the nearest contenteditable element
          while (
            editableEl &&
            editableEl !== frameDoc.body &&
            !editableEl.isContentEditable &&
            editableEl.getAttribute?.("contenteditable") !== "true"
          ) {
            editableEl = editableEl.parentElement;
          }

          if (
            editableEl &&
            (editableEl.isContentEditable ||
              editableEl.getAttribute?.("contenteditable") === "true")
          ) {
            lastSelectionRef.current = {
              range,
              editableEl,
              frameDoc,
            };
          } else {
            lastSelectionRef.current = null;
          }
        };

        frameDoc.addEventListener("mouseup", saveSelection);
        frameDoc.addEventListener("keyup", saveSelection);

        cleanupSelectionListeners = () => {
          frameDoc.removeEventListener("mouseup", saveSelection);
          frameDoc.removeEventListener("keyup", saveSelection);
        };
      });

      // Configure default styles for headings and text
      const styleManager = editorInstance.StyleManager;
      const typographySector = styleManager.getSector("Typography");
      if (typographySector) {
        // Set default font family
        const fontFamilyProp = typographySector.getProperty("font-family");
        if (fontFamilyProp) {
          fontFamilyProp.setValue("Inter, system-ui, sans-serif");
        }
      }

      // Load existing design if provided
      if (initialData?.design) {
        try {
          editorInstance.loadProjectData(initialData.design);
        } catch (error) {
          console.error("Error loading design:", error);
        }
      } else if (initialData?.html) {
        // If we have HTML but no design, set the HTML
        editorInstance.setComponents(initialData.html);
      } else {
        // Create default template with logo at the top
        editorInstance.setComponents(`
          <div style="padding: 20px; font-family: Inter, system-ui, sans-serif;">
            <div style="text-align: center; padding: 20px 0;">
              <img src="https://myrocky.b-cdn.net/WP%20Images/patient-portal/Rocky-portal-logo.png" alt="Rocky Logo" style="max-width: 120px; height: auto;" />
            </div>
            <div style="padding: 20px; background-color: #FFFFFF; border-radius: 8px; max-width: 600px; margin: 0 auto;">
              <h1 style="font-family: Inter, system-ui, sans-serif; font-size: 24px; font-weight: 600; color: #1d2327; margin: 0 0 16px 0;">Template header!</h1>
              <p style="font-family: Inter, system-ui, sans-serif; font-size: 16px; line-height: 24px; color: #1d2327; margin: 0;">This is your email template. Start editing to create your message.</p>
            </div>
          </div>
        `);
      }

      // Ensure blocks panel is visible after editor is ready
      editorInstance.on("load", () => {
        try {
          const blocks = editorInstance.Blocks.getAll();
          console.log("GrapesJS blocks loaded:", blocks.length);
          if (blocks.length === 0) {
            console.warn(
              "No blocks found. The preset-newsletter plugin may not be working correctly."
            );
          }
        } catch (error) {
          console.error("Error checking blocks:", error);
        }
      });

      setEditor(editorInstance);
      setEditorReady(true);
      editorRef.current = editorInstance;
    });

    // Cleanup function
    return () => {
      if (cleanupSelectionListeners) {
        cleanupSelectionListeners();
      }
      if (editorInstance && typeof editorInstance.destroy === "function") {
        editorInstance.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  /** Export HTML */
  const handleExportHtml = () => {
    if (!editor || !editorReady) return toast.error("Editor not ready");

    const html = editor.getHtml();
    const css = editor.getCss();
    const fullHtml = `<style>${css}</style>${html}`;

    setHtmlContent(fullHtml);
    setShowPreviewModal(true);
  };

  /** Insert Variable at caret position */
  const handleInsertVariable = (variable) => {
    if (!editor || !editorReady) return toast.error("Editor not ready");

    const selInfo = lastSelectionRef.current;

    // ✅ Best case: we have a saved caret inside a contenteditable element
    if (selInfo?.range && selInfo?.editableEl && selInfo?.frameDoc) {
      const { range, editableEl, frameDoc } = selInfo;

      try {
        range.deleteContents();
        const textNode = frameDoc.createTextNode(variable.key);
        range.insertNode(textNode);

        // Move caret after inserted text
        const newRange = frameDoc.createRange();
        newRange.setStartAfter(textNode);
        newRange.collapse(true);

        const sel = frameDoc.getSelection();
        sel.removeAllRanges();
        sel.addRange(newRange);

        // Sync back to GrapesJS component
        const selected = editor.getSelected();
        if (selected) {
          selected.set("content", editableEl.innerHTML);
          editor.trigger("component:update", selected);
        }

        // Update stored selection
        lastSelectionRef.current = {
          range: newRange,
          editableEl,
          frameDoc,
        };

        toast.success(`${variable.label} inserted!`);
        return;
      } catch (error) {
        console.error("Error inserting variable at caret:", error);
      }
    }

    // 🧯 Fallback: append to selected component content
    const selected = editor.getSelected();
    if (selected) {
      const current =
        selected.get("content") || selected.get("content") === ""
          ? selected.get("content")
          : selected.view?.el?.innerHTML || "";
      selected.set("content", `${current}${variable.key}`);
      editor.trigger("component:update", selected);
      toast.success(`${variable.label} inserted!`);
      return;
    }

    // Final fallback: copy to clipboard
    navigator.clipboard.writeText(variable.key);
    toast.success(
      `${variable.label} copied! Click on a text element and paste (Ctrl+V).`
    );
  };

  /** Save Template */
  const handleSaveTemplate = async () => {
    if (!editor || !editorReady) return toast.error("Editor not ready");
    if (!templateName.trim()) return toast.error("Please enter template name");

    setIsSaving(true);

    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const design = editor.getProjectData(); // Get the full design JSON

      const templateData = {
        name: templateName,
        subject: templateSubject || "Email Subject",
        html: `<style>${css}</style>${html}`,
        design: design, // Store GrapesJS project data
        scope: templateScope,
        trigger: templateTrigger,
      };

      let response;
      if (templateId) {
        response = await emailTemplateService.update(templateId, templateData);
        toast.success("Template updated successfully!");
      } else {
        response = await emailTemplateService.create(templateData);
        toast.success("Template saved successfully!");

        // Redirect to edit page after creating
        if (response?.id) {
          window.location.href = `/dashboard/email-templates/${response.id}`;
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  /** Send Test Email */
  const handleSendTestEmail = async () => {
    if (!editor || !editorReady) return toast.error("Editor not ready");
    if (!testEmailData.to.trim())
      return toast.error("Please enter recipient email");

    setIsSendingTest(true);

    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const fullHtml = `<style>${css}</style>${html}`;

      const testData = {
        to: testEmailData.to,
        subject: testEmailData.subject || templateSubject || "Test Email",
        html: fullHtml,
        text: emailTemplateService.extractTextFromHtml(fullHtml),
        variables: {
          user: {
            name: "Test User",
            email: testEmailData.to,
          },
          order: {
            id: "12345",
            total: "$99.99",
            date: new Date().toLocaleDateString(),
            trackingNumber: "TRACK123456",
          },
          store: {
            name: "Rocky Store",
          },
          product: {
            name: "Sample Product",
            price: "$29.99",
          },
          customer: {
            address: "123 Main St, City, State 12345",
          },
        },
      };

      await emailTemplateService.sendTestEmail(testData);
      toast.success("Test email sent successfully!");
      setShowTestEmailModal(false);
      setTestEmailData({ to: "", subject: "" });
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to send test email");
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 sm:p-6 flex-shrink-0">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Template Name
              </label>
              <CustomInput
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email Subject
              </label>
              <CustomInput
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              onClick={handleExportHtml}
              disabled={!editorReady}
              className="text-xs sm:text-sm"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />{" "}
              Export HTML
            </CustomButton>
            <CustomButton
              variant="primary"
              size="sm"
              onClick={handleSaveTemplate}
              disabled={!editorReady || isSaving}
              className="text-xs sm:text-sm"
            >
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />{" "}
              {isSaving ? "Saving..." : "Save Template"}
            </CustomButton>
            <CustomButton
              variant="secondary"
              size="sm"
              onClick={() => setShowTestEmailModal(true)}
              disabled={!editorReady}
              className="text-xs sm:text-sm"
            >
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Send
              Test Email
            </CustomButton>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => setShowVariablesSidebar(!showVariablesSidebar)}
              className="text-xs sm:text-sm"
            >
              <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />{" "}
              {showVariablesSidebar ? "Hide Variables" : "Show Variables"}
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Variables Sidebar */}
        <div
          className={cn(
            "absolute md:absolute z-20 w-64 bg-muted border-r border-border p-4 overflow-y-auto h-full transition-transform duration-300 ease-in-out",
            showVariablesSidebar ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-sm font-semibold text-foreground">Variables</h3>
            <button
              onClick={() => setShowVariablesSidebar(false)}
              className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {variables.map((variable) => (
              <button
                key={variable.key}
                onClick={() => handleInsertVariable(variable)}
                className="w-full text-left p-2.5 rounded-md text-sm bg-card border border-border hover:bg-accent hover:border-ring transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              >
                <div className="font-medium text-foreground">
                  {variable.label}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  {variable.key}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Overlay for mobile */}
        {showVariablesSidebar && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-10"
            onClick={() => setShowVariablesSidebar(false)}
          />
        )}

        {/* GrapesJS Editor Container */}
        <div className="flex-1 relative min-h-screen bg-card overflow-hidden flex flex-col">
          {!editorReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  Loading editor...
                </p>
              </div>
            </div>
          )}
          <div
            ref={containerRef}
            className="flex-1 min-h-screen w-full"
            style={{ height: "100%", minHeight: "100vh" }}
          />
        </div>
      </div>

      {/* Preview Modal */}
      <CustomModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="HTML Preview"
        size="xl"
      >
        <div className="space-y-4">
          <div className="border border-border rounded-md p-4 bg-muted max-h-[60vh] overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
              {htmlContent}
            </pre>
          </div>
          <div className="border border-border rounded-md p-4 bg-card">
            <h4 className="text-sm font-semibold mb-2 text-foreground">
              Preview:
            </h4>
            <div
              className="border border-border rounded p-4 bg-background"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
          <div className="flex justify-end">
            <CustomButton
              variant="outline"
              onClick={() => setShowPreviewModal(false)}
            >
              Close
            </CustomButton>
          </div>
        </div>
      </CustomModal>

      {/* Send Test Email Modal */}
      <CustomModal
        isOpen={showTestEmailModal}
        onClose={() => {
          setShowTestEmailModal(false);
          setTestEmailData({ to: "", subject: "" });
          setSelectedTestUserId("");
        }}
        title="Send Test Email"
        size="md"
      >
        <div className="space-y-4">
          {/* Test Users Dropdown */}
          {testUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Test User (optional)
              </label>
              <select
                value={selectedTestUserId}
                onChange={(e) => {
                  setSelectedTestUserId(e.target.value);
                  if (e.target.value === "") {
                    setTestEmailData((prev) => ({ ...prev, to: "" }));
                  }
                }}
                className="flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary dark:focus-visible:ring-primary focus-visible:border-primary dark:focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
              >
                <option value="">-- Or enter custom email --</option>
                {testUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                    {user.description ? ` - ${user.description}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Recipient Email *
            </label>
            <CustomInput
              type="email"
              value={testEmailData.to}
              onChange={(e) => {
                setTestEmailData({ ...testEmailData, to: e.target.value });
                // Clear selection if user manually types
                if (selectedTestUserId) {
                  setSelectedTestUserId("");
                }
              }}
              placeholder="recipient@example.com"
              disabled={isLoadingTestUsers}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subject (optional)
            </label>
            <CustomInput
              value={testEmailData.subject}
              onChange={(e) =>
                setTestEmailData({ ...testEmailData, subject: e.target.value })
              }
              placeholder={templateSubject || "Test Email"}
            />
          </div>
          <div className="flex justify-end gap-2">
            <CustomButton
              variant="outline"
              onClick={() => {
                setShowTestEmailModal(false);
                setTestEmailData({ to: "", subject: "" });
                setSelectedTestUserId("");
              }}
            >
              Cancel
            </CustomButton>
            <CustomButton
              variant="primary"
              onClick={handleSendTestEmail}
              disabled={isSendingTest || !testEmailData.to.trim()}
            >
              {isSendingTest ? "Sending..." : "Send Test Email"}
            </CustomButton>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
