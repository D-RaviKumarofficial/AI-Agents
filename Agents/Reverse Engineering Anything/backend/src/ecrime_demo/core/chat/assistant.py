"""Find the verified facts the language model may use, and answer emergencies. It writes no other answers."""

from typing import Any

from ecrime_demo.core.chat.intents import is_emergency
from ecrime_demo.core.chat.matching import ServiceMatch, ServiceMatcher
from ecrime_demo.core.chat.prompt import build_facts, service_facts
from ecrime_demo.models.chat_schemas import AccessData, AnswerSource, ChatResponse, ServiceRef
from ecrime_demo.settings import CONTACT_PHONE, EMERGENCY_NUMBER


class ChatbotEngine:
    """Retrieval for the language model. It never calls an external service and never stores messages."""

    def __init__(self, catalog: dict[str, Any], access: AccessData) -> None:
        """Index the catalog and remember the observed access data."""
        self._catalog = catalog
        self._access = access
        self._matcher = ServiceMatcher(catalog)
        self._services = [s for g in catalog["groups"] for s in g["services"]]

    def is_emergency(self, message: str) -> bool:
        """True if the message looks like an emergency. Those get the fixed 999 answer, not the model."""
        return is_emergency(message)

    def emergency(self) -> ChatResponse:
        """Point to the real emergency number. This website cannot send help."""
        text = (
            f"If someone is in danger, call {EMERGENCY_NUMBER} now. This demo website and its SOS button cannot "
            f"send help. For non-urgent questions you can call {CONTACT_PHONE}."
        )
        return ChatResponse(reply=text, source=AnswerSource.SAFETY)

    def retrieve(self, message: str) -> tuple[list[dict[str, Any]], list[ServiceRef]]:
        """Return the facts and references for the services the message is about."""
        matches = self._narrow(self._matcher.search(message))
        facts = [service_facts(m.service, m.group, self._access) for m in matches]
        return facts, [self._ref(m) for m in matches]

    def facts_block(self, service_facts_list: list[dict[str, Any]]) -> str:
        """The FACTS text for a model call."""
        categories = [c["name"] for c in self._catalog["sidebar"] if c["id"] != "all"]
        return build_facts(service_facts_list, categories, self._access, len(self._services))

    @staticmethod
    def _narrow(matches: list[ServiceMatch]) -> list[ServiceMatch]:
        """Keep only the services named in full when the message names more than one."""
        named = [m for m in matches if m.exact]
        return named if len(named) > 1 else matches

    def _ref(self, match: ServiceMatch) -> ServiceRef:
        """Build the API reference for a matched service."""
        service = match.service
        url = service.get("sourcePath")
        return ServiceRef(
            id=service["id"],
            name=service["name"],
            groupId=match.group["id"],
            groupName=match.group["name"],
            access=self._access.level(service["id"]),
            officialUrl=url if isinstance(url, str) and url.startswith("https://www.dubaipolice.gov.ae/") else None,
        )
