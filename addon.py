"""Default storefront frontend – grid/list layout options."""

from pathlib import Path
from typing import List, Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.addons.frontends.base import FrontendAddon

_DIST_DIR = Path(__file__).resolve().parent / "dist"


class DefaultFrontendConfig(BaseModel):
    """Frontend-specific options (site branding comes from SiteSettings)."""

    layout: Literal["grid", "list"] = Field(default="grid")
    products_per_page: int = Field(default=12, ge=1, le=100)
    show_category_nav: bool = Field(default=True)


class DefaultFrontendAddon(FrontendAddon):
    """Built-in placeholder storefront SPA."""

    addon_id: str = "default"
    addon_name: str = "Default Storefront"
    addon_description: str = "Simple storefront with configurable layout and navigation."
    addon_category: str = "frontend"
    version: str = "1.0.0"

    @classmethod
    def config_schema(cls):
        return DefaultFrontendConfig

    async def initialize(self, config: dict) -> None:
        schema = self.config_schema()
        validated = schema(**config)
        self._config = validated.model_dump(mode="json")
        self.is_enabled = True

    async def shutdown(self) -> None:
        self.is_enabled = False

    def get_static_directory(self) -> str:
        return str(_DIST_DIR)

    def get_admin_routes(self) -> List[APIRouter]:
        from app.addons.frontends.default.routes import admin_router

        return [admin_router]
