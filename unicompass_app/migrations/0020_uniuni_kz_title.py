# Generated by Django 5.1.1 on 2024-09-28 18:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('unicompass_app', '0019_populate_uniuni_from_qs_and_the'),
    ]

    operations = [
        migrations.AddField(
            model_name='uniuni',
            name='kz_title',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
