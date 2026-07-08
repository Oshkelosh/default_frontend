"""Admin routes for the default frontend addon."""

from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, RedirectResponse

from app.addons.admin_helpers import make_addon_jinja_env, render_addon_admin_page
from app.admin.routes import require_admin_session

_TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"
_CONFIGURE_URL = "/admin/frontends/default"

jinja_env = make_addon_jinja_env(_TEMPLATES_DIR)

admin_router = APIRouter()


def _page_context(addon: Any) -> dict[str, Any]:
    from app.addons.registry import addon_registry

    config: Dict[str, Any] = dict(addon_registry.get_config("default")) if addon else {}
    return {"addon": addon, "config": config}


@admin_router.get("")
async def default_frontend_config_page(
    request: Request,
    db=Depends(require_admin_session),
):
    """Default frontend layout options."""
    from app.addons.registry import addon_registry

    addon = addon_registry.get("default")
    return HTMLResponse(
        content=render_addon_admin_page(
            jinja_env,
            request,
            "default_config.html",
            "Default Storefront",
            **_page_context(addon),
        ),
    )


@admin_router.get("/", include_in_schema=False)
async def default_frontend_config_trailing_slash_redirect():
    """Redirect legacy trailing-slash URL to configure_url."""
    return RedirectResponse(url=_CONFIGURE_URL, status_code=307)


@admin_router.post("/save")
async def default_frontend_save_config(
    request: Request,
    db=Depends(require_admin_session),
):
    """Save default frontend configuration."""
    from app.addons.admin_helpers import save_addon_from_form
    from app.addons.registry import addon_registry

    try:
        form = await request.form()
        from app.addons.admin_helpers import require_addon_csrf

        require_addon_csrf(request, str(form.get("csrf_token", "")))
        config: Dict[str, Any] = {
            "layout": form.get("layout", "grid"),
            "products_per_page": int(form.get("products_per_page", 12) or 12),
            "hero_products": int(form.get("hero_products", 5) or 5),
            "category_products": int(form.get("category_products", 8) or 8),
            "show_category_nav": form.get("show_category_nav") == "on",
        }
        enabled = form.get("is_enabled") == "on"
        return await save_addon_from_form(
            db,
            "default",
            config,
            enabled=enabled,
            redirect_url=_CONFIGURE_URL,
            flash_message="Default storefront configuration saved",
        )
    except Exception as exc:
        return HTMLResponse(
            content=render_addon_admin_page(
                jinja_env,
                request,
                "default_config.html",
                "Default Storefront",
                flash=f"Error saving config: {exc}",
                flash_type="error",
                **_page_context(addon_registry.get("default")),
            ),
        )
