"""Default storefront frontend – grid/list layout options."""

from pathlib import Path
from typing import List, Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.addons.frontends.base import FrontendAddon
from app.addons.log import info
from app.addons.config_serialization import dump_addon_config

_DIST_DIR = Path(__file__).resolve().parent / "dist"


class DefaultFrontendConfig(BaseModel):
    """Frontend-specific options (site branding comes from SiteSettings)."""

    layout: Literal["grid", "list"] = Field(default="grid")
    products_per_page: int = Field(
        default=12,
        ge=1,
        le=100,
        description="Catalog pagination (/products, category pages).",
    )
    hero_products: int = Field(
        default=5,
        ge=1,
        le=100,
        description="Popular products in the homepage carousel.",
    )
    category_products: int = Field(
        default=8,
        ge=1,
        le=100,
        description="Products per category row on the homepage.",
    )
    show_category_nav: bool = Field(default=True)


class DefaultFrontendAddon(FrontendAddon):
    """Built-in placeholder storefront SPA."""

    addon_id: str = "default"
    addon_name: str = "Default Storefront"
    addon_description: str = "Simple storefront with configurable layout and navigation."
    addon_category: str = "frontend"
    version: str = "1.0.0"
    log_label: str = "Default"

    @classmethod
    def config_schema(cls):
        return DefaultFrontendConfig

    async def initialize(self, config: dict) -> None:
        schema = self.config_schema()
        validated = schema(**config)
        self._config = dump_addon_config(validated)
        self.is_enabled = True
        info("Default", "Storefront frontend initialized (layout={})", validated.layout)

    async def shutdown(self) -> None:
        self.is_enabled = False

    def get_static_directory(self) -> str:
        return str(_DIST_DIR)

    def get_admin_routes(self) -> List[APIRouter]:
        from app.addons.frontends.default.routes import admin_router

        return [admin_router]
