from backend.lms.apps.lessons.utils import get_truncated_name
from lms.apps.core.utils.abstract_models import AbstractTimestampedModel
from django.db import models


class QuestionTypes(models.TextChoices):
    MULTIPLE_CHOICE = "multiple_choice", "Множественный выбор"
    ORDERING = "ordering", "Упорядочивание"
    FILL_IN_THE_BLANKS = "fill_in_the_blanks", "Заполните пропуски"
    MATCHING = "matching", "Сопоставление"
    RECORD_AUDIO = "record_audio", "Запись аудио"


class Question(AbstractTimestampedModel):
    text = models.CharField(max_length=2000, verbose_name="Текст вопроса")
    question_type = models.CharField(
        max_length=50,
        choices=QuestionTypes.choices,
        verbose_name="Тип вопроса",
        help_text="Тип вопроса, например, множественный выбор, заполнение пропусков и т.д.",
    )

    class Meta:
        verbose_name = "Вопрос компонент"
        verbose_name_plural = "Вопросы компоненты"
        ordering = ["id"]

    def __str__(self):
        return f'Question: "{get_truncated_name(self.text)}" [#{self.pk}]'


class MultipleChoiceOption(AbstractTimestampedModel):
    """Options for multiple choice"""

    question = models.ForeignKey(
        Question, related_name="mc_options", on_delete=models.CASCADE
    )
    text = models.CharField(max_length=500, verbose_name="Текст ответа")
    is_correct = models.BooleanField(default=False)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{get_truncated_name(self.text)} ({'✓' if self.is_correct else '✗'}) [#{self.pk}]"


class OrderingItem(AbstractTimestampedModel):
    """Items to be ordered"""

    question = models.ForeignKey(
        Question, related_name="ordering_items", on_delete=models.CASCADE
    )
    text = models.CharField(max_length=500, verbose_name="Текст элемента")
    correct_order = models.PositiveIntegerField(verbose_name="Правильный порядок")

    class Meta:
        ordering = ["correct_order"]
        unique_together = ("question", "correct_order")

    def __str__(self):
        return f"{get_truncated_name(self.text)} (#{self.correct_order}) [#{self.pk}])"


class FillInBlankLine(AbstractTimestampedModel):
    """Fill in the blanks question"""

    question = models.ForeignKey(
        Question,
        related_name="fill_in_blanks",
        on_delete=models.CASCADE,
    )
    text = models.CharField(
        max_length=500,
        verbose_name="Текст пропуска",
        help_text="Use {{BLANK:1}}, {{BLANK:2}}, etc. to mark blank spaces with position numbers",
    )
    correct_answer = models.CharField(max_length=500, verbose_name="Правильный ответ")
    correct_answers = models.JSONField(
        default=list, help_text="List of correct answers in order of blanks."
    )

    class Meta:
        unique_together = ("question", "text")

    def __str__(self):
        return f"{get_truncated_name(self.text)} ({self.correct_answer}) [#{self.pk}]"


class MatchingElement(AbstractTimestampedModel):
    text = models.CharField(max_length=500, verbose_name="Текст элемента")
    image = models.ForeignKey(
        "attachments.Attachment",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="matching_elements",
    )
    question = models.ForeignKey(
        Question, related_name="matching_elements", on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{get_truncated_name(self.text)} [#{self.pk}]"


class MatchingPair(AbstractTimestampedModel):
    """Pairs of matching elements"""

    question = models.ForeignKey(
        Question, related_name="matching_pairs", on_delete=models.CASCADE
    )
    left_element = models.ForeignKey(
        MatchingElement,
        related_name="left_pairs",
        on_delete=models.CASCADE,
    )
    right_element = models.ForeignKey(
        MatchingElement,
        related_name="right_pairs",
        on_delete=models.CASCADE,
    )

    class Meta:
        unique_together = ("question", "left_element", "right_element")

    def __str__(self):
        return f"{self.left_element} ↔ {self.right_element} [#{self.pk}]"


class RecordAudioQuestion(AbstractTimestampedModel):
    title = models.CharField(max_length=200, verbose_name="Название вопроса")
    question = models.ForeignKey(
        Question, related_name="record_audio_questions", on_delete=models.CASCADE
    )
    instructions = models.TextField(
        verbose_name="Инструкции",
        help_text="Инструкции для пользователя по записи аудио",
    )


# class QuestionUserAnswer(AbstractTimestampedModel):
#     """User's answer to a question"""

#     question = models.ForeignKey(
#         Question, related_name="user_answers", on_delete=models.CASCADE
#     )
#     user = models.ForeignKey(
#         "auth.User", related_name="question_answers", on_delete=models.CASCADE
#     )
#     answer_text = models.TextField(verbose_name="Ответ пользователя")
#     is_correct = models.BooleanField(default=False, verbose_name="Правильный ответ")

#     class Meta:
#         unique_together = ("question", "user")

#     def __str__(self):
#         return f"Answer by {self.user} to {self.question} [#{self.pk}]"
