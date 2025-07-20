// services/blockRenderer.js
import React from "react";
import { parse as wpParse } from "@wordpress/block-serialization-default-parser";
import parse from "html-react-parser";
import sanitizeHtml from "sanitize-html";
import Image from "next/image";
// import BlockSlider from "../components/BlockSlider";

export class WordPressBlockRenderer {
  constructor(customComponents = {}) {
    this.customComponents = customComponents;
    this.allowedTags = {
      p: ["class", "style"],
      h1: ["class", "style"],
      h2: ["class", "style"],
      h3: ["class", "style"],
      h4: ["class", "style"],
      h5: ["class", "style"],
      h6: ["class", "style"],
      img: ["src", "alt", "width", "height", "class"],
      figure: ["class"],
      figcaption: ["class"],
      ul: ["class"],
      ol: ["class"],
      li: ["class"],
      blockquote: ["class", "cite"],
      a: ["href", "target", "rel", "class"],
      strong: ["class"],
      em: ["class"],
      span: ["class", "style"],
      div: ["class", "style"],
    };
  }

  // Parse raw WordPress content into blocks
  parseBlocks(content) {
    try {
      if (typeof content !== "string" || !content.includes("<!-- wp:")) {
        // Not a valid WP block string, return as a single HTML block
        return [{ blockName: null, innerHTML: content }];
      }
      const blocks = wpParse(content);
      return Array.isArray(blocks) ? blocks : [];
    } catch (error) {
      console.error("Error parsing blocks:", error);
      return [];
    }
  }

  // Safely sanitize HTML content
  sanitizeContent(html) {
    return sanitizeHtml(html, {
      allowedTags: Object.keys(this.allowedTags),
      allowedAttributes: this.allowedTags,
      allowedSchemes: ["http", "https", "mailto"],
      transformTags: {
        script: "div", // Convert script tags to divs
        style: "div", // Convert style tags to divs
      },
      parseStyleAttributes: false, // Disable style parsing for browser compatibility
    });
  }

  // Main render method
  renderBlocks(content) {
    const blocks = this.parseBlocks(content);
    return blocks.map((block, index) => this.renderBlock(block, index));
  }

  // Render individual block
  renderBlock(block, index) {
    const { blockName, attrs = {}, innerHTML = "", innerBlocks = [] } = block;

    // Check for custom component
    if (this.customComponents[blockName]) {
      const CustomComponent = this.customComponents[blockName];
      return (
        <CustomComponent
          key={index}
          attrs={attrs}
          innerHTML={innerHTML}
          innerBlocks={innerBlocks}
          renderer={this}
        />
      );
    }

    // Default block rendering
    switch (blockName) {
      case "core/paragraph":
        return this.renderParagraph(attrs, innerHTML, index);

      case "core/heading":
        return this.renderHeading(attrs, innerHTML, index);

      case "core/image":
        return this.renderImage(attrs, innerHTML, index);

      case "core/list":
        return this.renderList(attrs, innerHTML, index);

      case "core/quote":
        return this.renderQuote(attrs, innerHTML, index);

      case "core/columns":
        return this.renderColumns(attrs, innerBlocks, index);

      case "core/column":
        return this.renderColumn(attrs, innerBlocks, index);

      case "core/group":
        return this.renderGroup(attrs, innerBlocks, index);

      case "core/media-text":
        return this.renderMediaText(attrs, innerBlocks, index);

      case "core/gallery":
        return this.renderGallery(attrs, innerHTML, index);

      case "core/embed":
        return this.renderEmbed(attrs, innerHTML, index);

      case "core/cover":
        return this.renderCover(attrs, innerHTML, index);

      case null: // Classic block or HTML
        return this.renderHTML(innerHTML, index);

      default:
        return this.renderGenericBlock(
          blockName,
          attrs,
          innerHTML,
          innerBlocks,
          index
        );
    }
  }

  // Individual block renderers
  renderParagraph(attrs, innerHTML, index) {
    const cleanHTML = this.sanitizeContent(innerHTML);
    return (
      <p
        key={index}
        className={attrs.className || ""}
        style={{
          textAlign: attrs.align || "left",
          fontSize: attrs.fontSize || "inherit",
          color: attrs.textColor || "inherit",
          backgroundColor: attrs.backgroundColor || "transparent",
        }}
      >
        {parse(cleanHTML)}
      </p>
    );
  }

  renderHeading(attrs, innerHTML, index) {
    const level = attrs.level || 2;
    const Tag = `h${level}`;
    const cleanHTML = this.sanitizeContent(innerHTML);

    return React.createElement(
      Tag,
      {
        key: index,
        className: attrs.className || "",
        style: {
          textAlign: attrs.textAlign || "left",
          color: attrs.textColor || "inherit",
        },
      },
      parse(cleanHTML)
    );
  }

  renderImage(attrs, innerHTML, index) {
    return (
      <figure key={index} className={`wp-block-image ${attrs.className || ""}`}>
        <Image
          src={attrs.url}
          alt={attrs.alt || ""}
          width={attrs.width || 100}
          height={attrs.height || 100}
          style={{
            objectFit: attrs.scale || "cover",
          }}
        />
        {attrs.caption && (
          <figcaption>{parse(this.sanitizeContent(attrs.caption))}</figcaption>
        )}
      </figure>
    );
  }

  renderList(attrs, innerHTML, index) {
    const cleanHTML = this.sanitizeContent(innerHTML);
    const isOrdered = attrs.ordered || innerHTML.includes("<ol");
    const Tag = isOrdered ? "ol" : "ul";

    return React.createElement(
      Tag,
      {
        key: index,
        className: attrs.className || "",
        start: attrs.start || undefined,
      },
      parse(cleanHTML)
    );
  }

  renderQuote(attrs, innerHTML, index) {
    const cleanHTML = this.sanitizeContent(innerHTML);
    return (
      <blockquote
        key={index}
        className={`wp-block-quote ${attrs.className || ""}`}
        cite={attrs.citation}
      >
        {parse(cleanHTML)}
      </blockquote>
    );
  }

  renderColumns(attrs, innerBlocks, index) {
    return (
      <div key={index} className={`wp-block-columns ${attrs.className || ""}`}>
        {innerBlocks.map((block, blockIndex) =>
          this.renderBlock(block, `${index}-${blockIndex}`)
        )}
      </div>
    );
  }

  renderColumn(attrs, innerBlocks, index) {
    return (
      <div
        key={index}
        className={`wp-block-column ${attrs.className || ""}`}
        style={{ flexBasis: attrs.width || "auto" }}
      >
        {innerBlocks.map((block, blockIndex) =>
          this.renderBlock(block, `${index}-${blockIndex}`)
        )}
      </div>
    );
  }

  renderGroup(attrs, innerBlocks, index) {
    return (
      <div
        key={index}
        className={`wp-block-group ${attrs.className || ""}`}
        style={{
          backgroundColor: attrs.backgroundColor || "transparent",
          color: attrs.textColor || "inherit",
        }}
      >
        {innerBlocks.map((block, blockIndex) =>
          this.renderBlock(block, `${index}-${blockIndex}`)
        )}
      </div>
    );
  }

  renderMediaText(attrs, innerBlocks, index) {
    return (
      <div
        key={index}
        className={`wp-block-media-text ${attrs.className || ""}`}
      >
        {attrs.mediaUrl && (
          <figure className="wp-block-media-text__media">
            {attrs.mediaType === "video" ? (
              <video src={attrs.mediaUrl} controls />
            ) : (
              <Image
                src={attrs.mediaUrl}
                alt={attrs.mediaAlt || ""}
                width={100}
                height={100}
              />
            )}
          </figure>
        )}
        <div className="wp-block-media-text__content">
          {innerBlocks.map((block, blockIndex) =>
            this.renderBlock(block, `${index}-${blockIndex}`)
          )}
        </div>
      </div>
    );
  }

  renderGallery(attrs, innerHTML, index) {
    const cleanHTML = this.sanitizeContent(innerHTML);
    return (
      <figure
        key={index}
        className={`wp-block-gallery ${attrs.className || ""}`}
      >
        {parse(cleanHTML)}
      </figure>
    );
  }

  renderEmbed(attrs, innerHTML, index) {
    // Handle different embed types safely
    if (attrs.providerNameSlug === "youtube") {
      return this.renderYouTubeEmbed(attrs, index);
    }
    if (attrs.providerNameSlug === "twitter") {
      return this.renderTwitterEmbed(attrs, index);
    }

    // Fallback for other embeds
    const cleanHTML = this.sanitizeContent(innerHTML);
    return (
      <div key={index} className={`wp-block-embed ${attrs.className || ""}`}>
        {parse(cleanHTML)}
      </div>
    );
  }

  renderYouTubeEmbed(attrs, index) {
    const videoId = this.extractYouTubeId(attrs.url);
    if (!videoId) return null;

    return (
      <div key={index} className="wp-block-embed wp-block-embed-youtube">
        <div className="responsive-embed">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allowFullScreen
            loading="lazy"
            title="YouTube video"
          />
        </div>
      </div>
    );
  }

  renderTwitterEmbed(attrs, index) {
    // For Twitter embeds, you might want to use Twitter's widget.js
    // or create a custom Twitter component
    return (
      <div key={index} className="wp-block-embed wp-block-embed-twitter">
        <blockquote className="twitter-tweet">
          <a href={attrs.url}>View Tweet</a>
        </blockquote>
      </div>
    );
  }

  renderHTML(innerHTML) {
    let cleanHTML = this.sanitizeContent(innerHTML);
    cleanHTML = cleanHTML.replace(/\n/g, "");
    return parse(cleanHTML);
  }

  renderGenericBlock(blockName, attrs, innerHTML, innerBlocks, index) {
    const cleanHTML = this.sanitizeContent(innerHTML);

    return (
      <div
        key={index}
        className={`wp-block ${blockName?.replace("/", "-")} ${
          attrs.className || ""
        }`}
        data-block-type={blockName}
      >
        {innerHTML && parse(cleanHTML)}
        {innerBlocks.length > 0 &&
          innerBlocks.map((block, blockIndex) =>
            this.renderBlock(block, `${blockIndex}`)
          )}
      </div>
    );
  }

  // Utility methods
  extractYouTubeId(url) {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  }

  // Method to add custom block components
  addCustomComponent(blockName, component) {
    this.customComponents[blockName] = component;
  }

  // Method to update allowed HTML tags
  updateAllowedTags(tags) {
    this.allowedTags = { ...this.allowedTags, ...tags };
  }
}

// Usage example
export default WordPressBlockRenderer;
