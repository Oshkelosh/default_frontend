"""Minimal unit tests for the default addon."""

from app.addons.frontends.default.addon import DefaultFrontendAddon


def test_addon_identity():
    assert DefaultFrontendAddon.addon_id == "default"
    assert DefaultFrontendAddon.addon_category == "frontend"
