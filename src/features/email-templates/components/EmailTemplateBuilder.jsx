"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Download, Save, Mail, X, Menu, Upload } from "lucide-react";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomModal } from "@/components/ui/CustomModal";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomTextarea } from "@/components/ui/CustomTextarea";
import { CustomLabel } from "@/components/ui/CustomLabel";
import { CustomCard, CustomCardContent, CustomCardHeader, CustomCardTitle } from "@/components/ui/CustomCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { emailTemplateService } from "../services/emailTemplateService";
import { EMAIL_TRIGGERS, EMAIL_SCOPES, getTriggersForScope } from "../constants/emailTriggers";
import { cn } from "@/utils/cn";
import { Settings, FileText } from "lucide-react";

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
  const [templateDescription, setTemplateDescription] = useState(
    initialData?.description || ""
  );
  const [templateSubject, setTemplateSubject] = useState(
    initialData?.subject || ""
  );
  const [templateScope, setTemplateScope] = useState(
    initialData?.scope || "CUSTOM"
  );
  const [templateTrigger, setTemplateTrigger] = useState(
    initialData?.trigger || (initialData?.scope === "CUSTOM" ? "manual" : "")
  );
  const [templateBodyText, setTemplateBodyText] = useState(
    initialData?.bodyText || ""
  );
  const [templateCategory, setTemplateCategory] = useState(
    initialData?.metadata?.category || ""
  );
  const [templateIsEnabled, setTemplateIsEnabled] = useState(
    initialData?.isEnabled !== undefined ? initialData.isEnabled : true
  );
  const [templateVariables, setTemplateVariables] = useState(
    initialData?.variables || []
  );
  const [testEmailData, setTestEmailData] = useState({ to: "", subject: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showVariablesSidebar, setShowVariablesSidebar] = useState(false);
  const [testUsers, setTestUsers] = useState([]);
  const [isLoadingTestUsers, setIsLoadingTestUsers] = useState(false);
  const [selectedTestUserId, setSelectedTestUserId] = useState("");
  // Disable auto-extract if bodyText is already provided (editing existing template)
  const [autoExtractBodyText, setAutoExtractBodyText] = useState(
    !initialData?.bodyText
  );
  const [activeTab, setActiveTab] = useState("settings");

  // 👉 Remember the last caret/selection inside the GrapesJS iframe
  const lastSelectionRef = useRef(null);
  // Store editor instance for cleanup
  const editorInstanceRef = useRef(null);
  // File input ref for HTML import
  const fileInputRef = useRef(null);

  // Get available triggers for the selected scope
  const availableTriggers = useMemo(() => {
    return getTriggersForScope(templateScope);
  }, [templateScope]);

  // Reset trigger when scope changes (if current trigger is not available for new scope)
  useEffect(() => {
    if (templateScope === "CUSTOM") {
      setTemplateTrigger("manual");
    } else {
      const triggers = getTriggersForScope(templateScope);
      if (triggers.length > 0 && !triggers.find((t) => t.value === templateTrigger)) {
        setTemplateTrigger(triggers[0].value);
      }
    }
  }, [templateScope, templateTrigger]);

  // Auto-extract variables and bodyText when HTML or subject changes
  useEffect(() => {
    if (!editor || !editorReady) return;

    const updateExtractedData = () => {
      try {
        const html = editor.getHtml();
        const css = editor.getCss();
        const fullHtml = `<style>${css}</style>${html}`;
        
        // Extract variables from HTML and subject
        const extractedVariables = emailTemplateService.extractVariables(
          fullHtml,
          templateSubject
        );
        // Always update variables - extracted variables are the source of truth
        setTemplateVariables(extractedVariables);

        // Auto-extract bodyText if enabled
        if (autoExtractBodyText && fullHtml) {
          const extractedBodyText = emailTemplateService.extractTextFromHtml(fullHtml);
          if (extractedBodyText) {
            setTemplateBodyText(extractedBodyText);
          }
        }
      } catch (error) {
        console.error("Error updating extracted data:", error);
      }
    };

    // Initial extraction when editor is ready (with a small delay to ensure content is loaded)
    const timeoutId = setTimeout(() => {
      updateExtractedData();
    }, 1000);

    // Listen to component updates in the editor
    editor.on("component:update", updateExtractedData);
    editor.on("component:add", updateExtractedData);
    editor.on("component:remove", updateExtractedData);
    editor.on("storage:store", updateExtractedData);
    editor.on("load", updateExtractedData);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      editor.off("component:update", updateExtractedData);
      editor.off("component:add", updateExtractedData);
      editor.off("component:remove", updateExtractedData);
      editor.off("storage:store", updateExtractedData);
      editor.off("load", updateExtractedData);
    };
  }, [editor, editorReady, templateSubject, autoExtractBodyText]);

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

  // Initialize GrapesJS Editor - only initialize when editor tab is active
  useEffect(() => {
    // Only initialize when editor tab is active
    if (activeTab !== "editor") {
      // Keep editor alive when switching away, just hide it
      return;
    }
    
    // Don't re-initialize if editor already exists
    if (editor) {
      // Editor exists, ensure it refreshes when tab becomes visible
      if (editorReady && containerRef.current) {
        try {
          const container = containerRef.current;
          const containerStyle = window.getComputedStyle(container);
          if (containerStyle.display !== "none" && containerStyle.visibility !== "hidden") {
            // Container is visible, refresh editor canvas to ensure proper rendering
            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
              try {
                if (editor && editor.Canvas) {
                  // Trigger canvas refresh using GrapesJS API
                  const frameEl = editor.Canvas.getFrameEl();
                  if (frameEl) {
                    // Force a reflow to ensure proper rendering
                    frameEl.style.display = 'none';
                    frameEl.offsetHeight; // Trigger reflow
                    frameEl.style.display = '';
                  }
                  // Also trigger editor refresh
                  editor.trigger('canvas:ready');
                }
              } catch (error) {
                console.warn("Error refreshing editor canvas:", error);
              }
            });
          }
        } catch (error) {
          console.warn("Error checking editor visibility:", error);
        }
      }
      return;
    }

    let editorInstance = null;
    let cleanupSelectionListeners = null;
    let initTimeout = null;
    let retryTimeout = null;
    let retryCount = 0;
    const maxRetries = 20; // Max 4 seconds (20 * 200ms)

    // Check if container is ready for initialization
    const isContainerReady = () => {
      if (!containerRef.current) {
        return false;
      }

      const container = containerRef.current;
      
      // Check if container is in DOM
      if (!container.isConnected) {
        return false;
      }

      // Check if container is visible
      const containerStyle = window.getComputedStyle(container);
      if (containerStyle.display === "none" || containerStyle.visibility === "hidden") {
        return false;
      }

      // Check if container has dimensions
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        return false;
      }

      return true;
    };

    // Initialize editor function with retry logic
    const initializeEditor = () => {
      // Check if editor was already initialized
      if (editor) {
        return;
      }

      // Check if container is ready
      if (!isContainerReady()) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Container not ready, retrying... (${retryCount}/${maxRetries})`);
          retryTimeout = setTimeout(() => {
            if (activeTab === "editor" && !editor) {
              initializeEditor();
            }
          }, 200);
        } else {
          console.error("Failed to initialize editor: container not ready after max retries");
          toast.error("Editor failed to load. Please refresh the page.");
        }
        return;
      }

      // Reset retry count on successful check
      retryCount = 0;

      console.log("Initializing GrapesJS editor...");
      
      // Dynamically import GrapesJS to avoid SSR issues
      Promise.all([
        import("grapesjs"),
        import("grapesjs-preset-newsletter"),
      ]).then(([grapesjs, presetNewsletter]) => {
        // Final check before initialization
        if (!isContainerReady() || activeTab !== "editor" || editor) {
          console.warn("Container not ready or tab changed before editor initialization");
          return;
        }

        try {
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

          // Store editor instance
          editorInstanceRef.current = editorInstance;
          setEditor(editorInstance);
          setEditorReady(true);
          editorRef.current = editorInstance;
          
          console.log("GrapesJS editor initialized successfully");
        } catch (error) {
          console.error("Error initializing GrapesJS editor:", error);
          toast.error("Failed to initialize editor");
        }
          }).catch((error) => {
        console.error("Error loading GrapesJS:", error);
        toast.error("Failed to load editor");
      });
    };

    // Start initialization attempt after a short delay
    initTimeout = setTimeout(() => {
      initializeEditor();
    }, 100); // Start checking after 100ms

    // Cleanup function
    return () => {
      // Clear timeouts
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }

      // Cleanup selection listeners
      if (cleanupSelectionListeners) {
        cleanupSelectionListeners();
      }

      // Note: We don't destroy the editor when switching tabs to avoid re-initialization issues
      // The editor will persist and be reused when switching back to the editor tab
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // Re-run when tab changes

  /** Export HTML */
  const handleExportHtml = () => {
    if (!editor || !editorReady) return toast.error("Editor not ready");

    const html = editor.getHtml();
    const css = editor.getCss();
    const fullHtml = `<style>${css}</style>${html}`;

    setHtmlContent(fullHtml);
    setShowPreviewModal(true);
  };

  /** Import HTML from file */
  const handleImportHtml = () => {
    if (!editor || !editorReady) {
      toast.error("Editor not ready");
      return;
    }

    // Trigger file input click
    fileInputRef.current?.click();
  };

  /** Handle file selection and load HTML into editor */
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      toast.error("Please select an HTML file (.html or .htm)");
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const htmlContent = e.target?.result;
        if (!htmlContent || typeof htmlContent !== 'string') {
          toast.error("Failed to read HTML file");
          return;
        }

        // Parse HTML and extract body content
        // Remove DOCTYPE, html, head, and body tags, keeping only the inner content
        let cleanedHtml = htmlContent;

        // Remove DOCTYPE if present
        cleanedHtml = cleanedHtml.replace(/<!DOCTYPE[^>]*>/gi, '');
        
        // Remove HTML tags but keep content
        cleanedHtml = cleanedHtml.replace(/<html[^>]*>/gi, '');
        cleanedHtml = cleanedHtml.replace(/<\/html>/gi, '');
        
        // Remove head tag and its content
        cleanedHtml = cleanedHtml.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
        
        // Remove body tag but keep content
        cleanedHtml = cleanedHtml.replace(/<body[^>]*>/gi, '');
        cleanedHtml = cleanedHtml.replace(/<\/body>/gi, '');

        // Remove style tags (GrapesJS will handle styles separately)
        // But keep inline styles
        cleanedHtml = cleanedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

        // Trim whitespace
        cleanedHtml = cleanedHtml.trim();

        if (!cleanedHtml) {
          toast.error("No content found in HTML file");
          return;
        }

        // Load HTML into editor
        if (editor && editorReady) {
          editor.setComponents(cleanedHtml);
          toast.success("HTML template imported successfully!");
          
          // Auto-extract variables and body text
          const extractedVariables = emailTemplateService.extractVariables(
            cleanedHtml,
            templateSubject
          );
          setTemplateVariables(extractedVariables);

          if (autoExtractBodyText) {
            const extractedBodyText = emailTemplateService.extractTextFromHtml(cleanedHtml);
            setTemplateBodyText(extractedBodyText);
          }
        } else {
          toast.error("Editor is not ready");
        }
      } catch (error) {
        console.error("Error importing HTML:", error);
        toast.error("Failed to import HTML file: " + (error.message || "Unknown error"));
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read HTML file");
    };

    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
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
      const fullHtml = `<style>${css}</style>${html}`;
      const design = editor.getProjectData(); // Get the full design JSON

      // Extract variables from HTML and subject
      const extractedVariables = emailTemplateService.extractVariables(
        fullHtml,
        templateSubject
      );

      // Use extracted variables or merge with existing
      const variables = extractedVariables.length > 0
        ? extractedVariables
        : templateVariables;

      // Use bodyText if provided, otherwise extract from HTML
      const bodyText = templateBodyText.trim()
        ? templateBodyText
        : emailTemplateService.extractTextFromHtml(fullHtml);

      const templateData = {
        name: templateName.trim(),
        description: templateDescription.trim(),
        subject: templateSubject.trim() || "Email Subject",
        html: fullHtml,
        bodyHtml: fullHtml,
        bodyText: bodyText,
        design: design, // Store GrapesJS project data
        scope: templateScope,
        trigger: templateScope === "CUSTOM" ? "manual" : templateTrigger,
        variables: variables,
        metadata: {
          category: templateCategory.trim(),
          design: design,
        },
        isEnabled: templateIsEnabled,
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
      {/* Header with Action Buttons */}
      <div className="bg-card border-b border-border p-4 sm:p-6 flex-shrink-0">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              onClick={handleImportHtml}
              disabled={!editorReady}
              className="text-xs sm:text-sm"
              title="Import HTML file"
            >
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />{" "}
              Import HTML
            </CustomButton>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={handleExportHtml}
              disabled={!editorReady}
              className="text-xs sm:text-sm"
              title="Export HTML"
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
          </div>
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
      
      {/* Hidden file input for HTML import - moved outside header to avoid layout issues */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.htm"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Tabs Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs Navigation */}
          <div className="bg-card border-b border-border px-4 sm:px-6 py-2 flex-shrink-0">
            <TabsList className="bg-transparent h-auto p-0 gap-1">
              <TabsTrigger value="settings" icon={Settings} className="px-4 py-2">
                Settings
              </TabsTrigger>
              <TabsTrigger value="editor" icon={FileText} className="px-4 py-2">
                Editor
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Settings Tab */}
          <TabsContent value="settings" className="flex-1 overflow-y-auto p-4 sm:p-6 m-0">
            <div className="max-w-4xl mx-auto space-y-6">
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Template Settings</CustomCardTitle>
                </CustomCardHeader>
                <CustomCardContent className="space-y-6">
                  {/* Basic Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <CustomLabel className="mb-1.5">Template Name *</CustomLabel>
                      <CustomInput
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Enter template name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <CustomLabel className="mb-1.5">Email Subject *</CustomLabel>
                      <CustomInput
                        value={templateSubject}
                        onChange={(e) => setTemplateSubject(e.target.value)}
                        placeholder="Enter email subject (e.g., Thanks for your order, {{user.name}}!)"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <CustomLabel className="mb-1.5">Description</CustomLabel>
                    <CustomTextarea
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      placeholder="Enter template description (e.g., Sent to customers after placing an order)"
                      className="w-full"
                      rows={2}
                    />
                  </div>

                  {/* Scope and Trigger */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <CustomLabel className="mb-1.5">Scope</CustomLabel>
                      <select
                        value={templateScope}
                        onChange={(e) => setTemplateScope(e.target.value)}
                        className="flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary dark:focus-visible:ring-primary focus-visible:border-primary dark:focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                      >
                        {EMAIL_SCOPES.map((scope) => (
                          <option key={scope.value} value={scope.value}>
                            {scope.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <CustomLabel className="mb-1.5">Trigger</CustomLabel>
                      <select
                        value={templateTrigger}
                        onChange={(e) => setTemplateTrigger(e.target.value)}
                        disabled={templateScope === "CUSTOM"}
                        className="flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary dark:focus-visible:ring-primary focus-visible:border-primary dark:focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                      >
                        {templateScope === "CUSTOM" ? (
                          <option value="manual">Manual</option>
                        ) : (
                          <>
                            <option value="">Select a trigger</option>
                            {availableTriggers.map((trigger) => (
                              <option key={trigger.value} value={trigger.value}>
                                {trigger.label}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Category and Enabled */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <CustomLabel className="mb-1.5">Category</CustomLabel>
                      <CustomInput
                        value={templateCategory}
                        onChange={(e) => setTemplateCategory(e.target.value)}
                        placeholder="e.g., commerce, marketing, notifications"
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-8">
                      <input
                        type="checkbox"
                        id="isEnabled"
                        checked={templateIsEnabled}
                        onChange={(e) => setTemplateIsEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <CustomLabel htmlFor="isEnabled" className="cursor-pointer">
                        Template Enabled
                      </CustomLabel>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>

              {/* Advanced Settings */}
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Advanced Settings</CustomCardTitle>
                </CustomCardHeader>
                <CustomCardContent className="space-y-6">
                  {/* Body Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <CustomLabel>Body Text (Plain Text Version)</CustomLabel>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="autoExtractBodyText"
                          checked={autoExtractBodyText}
                          onChange={(e) => setAutoExtractBodyText(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <CustomLabel htmlFor="autoExtractBodyText" className="text-xs cursor-pointer">
                          Auto-extract from HTML
                        </CustomLabel>
                      </div>
                    </div>
                    <CustomTextarea
                      value={templateBodyText}
                      onChange={(e) => setTemplateBodyText(e.target.value)}
                      placeholder="Plain text version of the email (auto-extracted from HTML if enabled)"
                      className="w-full"
                      rows={4}
                      disabled={autoExtractBodyText}
                    />
                  </div>

                  {/* Variables Display */}
                  {templateVariables.length > 0 && (
                    <div>
                      <CustomLabel className="mb-1.5">Detected Variables</CustomLabel>
                      <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md">
                        {templateVariables.map((variable, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                          >
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Variables are automatically extracted from the HTML and subject fields.
                      </p>
                    </div>
                  )}
                </CustomCardContent>
              </CustomCard>
            </div>
          </TabsContent>

          {/* Editor Tab - always render to keep editor instance alive */}
          <TabsContent value="editor" className="flex-1 overflow-hidden m-0 p-0" alwaysRender={true}>
            <div className="flex flex-1 overflow-hidden relative h-full">
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
              <div className="flex-1 relative bg-card overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
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
                  ref={(el) => {
                    containerRef.current = el;
                    // Container ref is set, initialization will happen in useEffect with retry logic
                  }}
                  className="flex-1 w-full"
                  style={{ minHeight: 0, height: "100%" }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
